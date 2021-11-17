import React, { useState, useCallback, useEffect } from 'react';
import EstadoLectura from './componentes/EstadoLectura';


import FormularioEntradaAlbaran from './componentes/FormularioEntradaAlbaran';
import PantallaCarga from './componentes/PantallaCarga';
import PantallaError from './componentes/PantallaError';
import PosicionesAlbaran from './componentes/PosicionesAlbaran';
import useDrm from './hooks/useDrm';
import useSapApiCall from './hooks/useSapApiCall';
import BarraSuperior from './componentes/BarraSuperior';
import useInterval from './hooks/useInterval';
import useArray from './hooks/useArray';
import { Grid } from '@material-ui/core';


function App() {

	let [config/*, setConfig*/] = useState({
		sap: {
			baseUrl: 'https://t01-ws.hefame.es/api',
			usuario: 'interno',
			password: '64v1R14.$'
		},
		drm: {
			baseUrl: "https://drm.hefame.es/soap/UX01",
			usuario: 'admin',
			password: 'admin'
		}
	});


	let [vbeln, setVbeln] = useState(null);

	let { sapGetAlbaran, sapVerificaMateriales } = useSapApiCall(config.sap)
	let [errores, { empty: limpiarErrores, push: agregarError }] = useArray([]);
	let { totalLecturasDrm, obtenerLecturasPendienteVerificar, iniciarLecturasDrm, setConsultaActiva } = useDrm(vbeln, config.drm);

	// **MAESTROS**
	let [datosAlbaranSap, setDatosAlbaranSap] = useState({ cargando: true, datos: null, error: null });


	console.log(datosAlbaranSap)
	console.log(totalLecturasDrm)



	let [verificando, setVerificando] = useState(0);
	let [ultimasVerificadas, setUltimasVerificadas] = useState([])

	const cargarDatosAlbaranSap = useCallback(async () => {

		if (vbeln) {
			try {
				setConsultaActiva(false);
				setDatosAlbaranSap({ cargando: true, error: null, datos: null });
				let datosAlbaran = await sapGetAlbaran(vbeln);
				console.log.apply(datosAlbaran);

				if (datosAlbaran.message) {
					setDatosAlbaranSap({ cargando: false, error: new Error(datosAlbaran.message), datos: null });
					
				} else {
					
					datosAlbaran.s_positions.push({
						arktx: "HUEVINA",
						bismt: "686725",
						charg: "*",
						lfimg: 300,
						matnr: "000008435232348408",
						t_matnr_ad: [ {"ean11": "000008435232348408"} ]
					})
					
					datosAlbaran?.s_positions.forEach( posicion => {
						if (!posicion.charg) posicion.charg = '*'
						posicion.codigosMaterialAdmitidos = posicion.t_matnr_ad.map( v => parseInt(v.ean11) );
					})
					
					setDatosAlbaranSap({ cargando: false, error: null, datos: datosAlbaran });
					setConsultaActiva(true);
				}

			} catch (error) {
				setDatosAlbaranSap({ cargando: false, error: error, datos: null });
			}
		}
	}, [setConsultaActiva, vbeln, setDatosAlbaranSap, sapGetAlbaran])

	const verificarLecturas = useCallback(async () => {

		if (!vbeln || verificando > 0) return;

		let lecturasPendientes = obtenerLecturasPendienteVerificar();

		if (lecturasPendientes.length !== verificando) {
			setVerificando(lecturasPendientes.length);
		}

		if (lecturasPendientes.length) {

			let erroresAcumulados = null;
			try {
				// IDENTIFICAR AQUELLAS QUE NO COINCIDEN CON EL ALBARAN ACTUAL Y ELIMINARLAS
				lecturasPendientes = lecturasPendientes.filter(lectura => {
					let encontrado = datosAlbaranSap?.datos.s_positions.find(pos => {
						return (pos.codigosMaterialAdmitidos.includes(lectura.ean) && (pos.charg === lectura.lote || pos.charg === '*'))
					})

					if (!encontrado) {
						if (!erroresAcumulados) erroresAcumulados = {}
						if (!erroresAcumulados[lectura.ean]) erroresAcumulados[lectura.ean] = {};
						if (!erroresAcumulados[lectura.ean][lectura.lote]) erroresAcumulados[lectura.ean][lectura.lote] = 0;
						erroresAcumulados[lectura.ean][lectura.lote]++;
					} 
					return encontrado;
				})
				if (erroresAcumulados) {
					for (let ean in erroresAcumulados) {
						for (let lote in erroresAcumulados[ean]) {
							let cantidad = erroresAcumulados[ean][lote];
							agregarError(`Se ha${cantidad === 1 ? '' : 'n'} leído ${cantidad} unidad${cantidad === 1 ? '' : 'es'} del material ${ean} con lote ${lote} que no se esperaba en este albarán.`)
						}
					}
				}

				// VERIFICAR LAS SUPERVIVIENTES CONTRA SAP

				if (lecturasPendientes.length) {

					let vbelnSaneado = vbeln;
					if (vbelnSaneado.startsWith('E')) {
						vbelnSaneado = vbelnSaneado.slice(1);
					}

					let resultadoVerificacion = await sapVerificaMateriales(vbelnSaneado, datosAlbaranSap.datos.werks, lecturasPendientes)

					if (resultadoVerificacion.message) {
						agregarError(`Error al llamar a SAP: ${resultadoVerificacion?.message}`)
					} else {
						let resumenVerificados = null;
						resultadoVerificacion?.s_positions?.forEach(r => {
							/*
								"status": "ACTIVE",
								"reason": "",
								"retcode": "NMVS_SUCCESS",
								"retcode_d": "Successfully processed."
							*/
							if (r.check_emvo && r.status !== 'ACTIVE') {
								agregarError(`Error al verificar el material ${r.matnr} con número de serie ${r.serial}: ${r.retcode_d}`)
							} else {
								if (!resumenVerificados) resumenVerificados = {}
								if (!resumenVerificados[r.matnr]) resumenVerificados[r.matnr] = {}
								if (!resumenVerificados[r.matnr][r.charg]) resumenVerificados[r.matnr][r.charg] = 0
								resumenVerificados[r.matnr][r.charg]++;
							}
						})

						if (resumenVerificados) {
							setUltimasVerificadas(resumenVerificados);
						}
					}
				}

			} catch (errorVerificacionSap) {
				console.error(errorVerificacionSap);
				agregarError(`Error al llamar a SAP: ${errorVerificacionSap?.message}`)
			}
		}

		setVerificando(0);
	}, [vbeln, datosAlbaranSap, verificando, setVerificando, obtenerLecturasPendienteVerificar, sapVerificaMateriales, agregarError, setUltimasVerificadas]);


	useEffect(cargarDatosAlbaranSap, [vbeln, cargarDatosAlbaranSap])
	useEffect(() => { if (vbeln) iniciarLecturasDrm() }, [vbeln, iniciarLecturasDrm])
	useEffect(() => { if (vbeln) limpiarErrores() }, [vbeln, limpiarErrores])
	useInterval(verificarLecturas, 1000)

	// PINTA Y COLOREA
	let datos = datosAlbaranSap?.datos;

	if (!vbeln) {
		return <div className="App">
			<BarraSuperior vbeln={vbeln} werks={datos?.werks} onCerrar={() => setVbeln(null)} />
			<FormularioEntradaAlbaran onAlbaranCambiado={setVbeln} />
		</div >
	}

	if (datosAlbaranSap.cargando) {
		return <div className="App">
			<BarraSuperior vbeln={vbeln} werks={datos?.werks} onCerrar={() => setVbeln(null)} />
			<PantallaCarga />
		</div >
	}

	if (datosAlbaranSap.error) {
		return <div className="App">
			<BarraSuperior vbeln={vbeln} werks={datos?.werks} onCerrar={() => setVbeln(null)} />
			<PantallaError error={datosAlbaranSap.error} />
		</div >
	}

	return (

		<div className="App">

			<BarraSuperior vbeln={vbeln} werks={datos?.werks} onCerrar={() => setVbeln(null)} />
			<Grid container>
				<Grid item xs={12} sm={6}>
					<PosicionesAlbaran posiciones={datos.s_positions} lecturas={totalLecturasDrm} />
				</Grid>
				<Grid item xs={12} sm={6}>
					<EstadoLectura errores={errores} limpiarErrores={limpiarErrores} verificando={verificando} ultimasVerificadas={ultimasVerificadas} />
				</Grid>
			</Grid>

		</div>
	);
}

export default App;
