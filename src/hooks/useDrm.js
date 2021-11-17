import clone from 'clone';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useApiCall } from './useApiCall';
import useInterval from './useInterval';


const XMLParser = require('react-xml-parser');


const generarParametrosLlamadaSoap = (comando, usuario, password, numeroAlbaran) => {
	return {
		body: `<?xml version="1.0"?>
			<soap-env:Envelope xmlns:soap-env="http://schemas.xmlsoap.org/soap/envelope/">
				<soap-env:Body>
					<n0:${comando} xmlns:n0="http://tempuri.org/">
						<n0:IdAlbaranp>${numeroAlbaran}</n0:IdAlbaranp>
						<n0:User>${usuario}</n0:User>
						<n0:Pass>${password}</n0:Pass>
					</n0:${comando}>
				</soap-env:Body>
			</soap-env:Envelope>`,
		headers: {
			'Content-Type': 'text/xml; charset=utf-8',
			'SoapAction': `"http://tempuri.org/IDRMSevemSoapWS/${comando}"`
		},
		mode: 'cors'
	}
}


export default function useDrm(vbeln, { baseUrl, usuario, password }) {

	let { post } = useApiCall(baseUrl);

	const [consultaActiva, setConsultaActiva] = useState(false);

	const drmGetAlbaranCompleto = useCallback(async () => {

		let parametros = generarParametrosLlamadaSoap('GetFromAlbaranp', usuario, password, vbeln);

		let resultado = await post('/DRMSevemSoapWS.svc', null, parametros)
		let xmlCrudo = await resultado.text();

		let registros = new XMLParser().parseFromString(xmlCrudo).getElementsByTagName('a:RegistroSevem');
		let lectura = {}
		registros.forEach(r => {
			let nSerie = r.getElementsByTagName("a:SerialNo")?.[0].value;
			if (nSerie) {
				lectura[nSerie] = {
					ean: parseInt(r.getElementsByTagName("a:ProductCode")?.[0]?.value),
					cn: r.getElementsByTagName("a:NationalNumber")?.[0].value,
					lote: r.getElementsByTagName("a:Batch")?.[0].value,
					caducidad: r.getElementsByTagName("a:Exp")?.[0].value,
					serie: nSerie
				}
			}
		})

		return lectura;

	}, [vbeln, post, usuario, password]);
	const drmGetAlbaranUltimos = useCallback(async () => {

		let parametros = generarParametrosLlamadaSoap('GetLastInputBoxFromAlbaranp', usuario, password, vbeln);

		let resultado = await post('/DRMSevemSoapWS.svc', null, parametros)
		let xmlCrudo = await resultado.text();

		let registros = new XMLParser().parseFromString(xmlCrudo).getElementsByTagName('a:RegistroSevem');

		let lectura = {}
		registros.forEach(r => {
			let nSerie = r.getElementsByTagName("a:SerialNo")?.[0].value;
			if (nSerie) {
				lectura[nSerie] = {
					ean: parseInt(r.getElementsByTagName("a:ProductCode")?.[0]?.value),
					cn: r.getElementsByTagName("a:NationalNumber")?.[0].value,
					lote: r.getElementsByTagName("a:Batch")?.[0].value,
					caducidad: r.getElementsByTagName("a:Exp")?.[0].value,
					serie: nSerie
				}
			}
		})

		return lectura;

	}, [vbeln, post, usuario, password]);

	let refProcesando = useRef(false);
	let refAcumuladoLecturasDrm = useRef({});
	let refTotalLecturasDrm = useRef({});
	let refLecturasPendienteVerificar = useRef([]);

	const _procesarTandaDrm = useCallback((nuevasLecturas, marcarPendienteVerificar) => {

		let nuevosTotales = refTotalLecturasDrm.current;

		for (let lectura in nuevasLecturas) {
			if (!refAcumuladoLecturasDrm.current[lectura]) {
				let lecturaNueva = nuevasLecturas[lectura];

				lecturaNueva.pendienteVerificar = marcarPendienteVerificar;

				refLecturasPendienteVerificar.current.push(lecturaNueva);
				refAcumuladoLecturasDrm.current[lectura] = lecturaNueva;

				if (!nuevosTotales[lecturaNueva.ean]) nuevosTotales[lecturaNueva.ean] = {}
				if (!nuevosTotales[lecturaNueva.ean][lecturaNueva.lote]) nuevosTotales[lecturaNueva.ean][lecturaNueva.lote] = 0;
				nuevosTotales[lecturaNueva.ean][lecturaNueva.lote]++;
			}
		}


	}, [refTotalLecturasDrm, refLecturasPendienteVerificar]);

	const obtenerUltimaTandaDrm = useCallback(async () => {
		if (vbeln && consultaActiva) {
			try {
				refProcesando.current = true;
				let datosNuevosDrm = await drmGetAlbaranUltimos();
				_procesarTandaDrm(datosNuevosDrm, true);
				refProcesando.current = false;
			} catch (error) {
				console.log('AL obtener UltimaTandaDrm DATOS DEL ESCANER', error);
			}
		}
	}, [consultaActiva, vbeln, drmGetAlbaranUltimos, _procesarTandaDrm])

	const iniciarLecturasDrm = useCallback(async () => {
		if (vbeln && consultaActiva) {
			try {
				refProcesando.current = true;
				await obtenerUltimaTandaDrm();
				let datosNuevosDrm = await drmGetAlbaranCompleto();
				_procesarTandaDrm(datosNuevosDrm, false);
				refProcesando.current = false;
			} catch (error) {
				console.log('AL iniciarLecturasDrm DATOS DEL ESCANER', error);
			}
		}
	}, [consultaActiva, vbeln, drmGetAlbaranCompleto, _procesarTandaDrm, obtenerUltimaTandaDrm])

	const obtenerLecturasPendienteVerificar = useCallback(() => {
		if (refProcesando.current) return []
		if (refLecturasPendienteVerificar.current.length) {
			let retorno = clone(refLecturasPendienteVerificar.current);
			refLecturasPendienteVerificar.current = [];
			return retorno;
		}
		return [];
	}, [refLecturasPendienteVerificar])

	useInterval(obtenerUltimaTandaDrm, 2000);

	useEffect(() => {
		if (vbeln) {
			refProcesando.current = false
			refAcumuladoLecturasDrm.current = {}
			refTotalLecturasDrm.current = {}
			refLecturasPendienteVerificar.current = []
		}
	}, [vbeln]);

	return {
		acumuladoLecturasDrm: refAcumuladoLecturasDrm,
		totalLecturasDrm: refTotalLecturasDrm.current,
		obtenerLecturasPendienteVerificar,
		iniciarLecturasDrm,
		obtenerUltimaTandaDrm,
		setConsultaActiva
	}


}