import { useCallback } from 'react';
import { useApiCall } from "./useApiCall"
import crypto from 'crypto';

function calcularCabecerasSap(usuario, password) {
	let salt = (new Date()).getTime();
	let hashAlgo = 'MD5';
	let hashKey = crypto.createHash(hashAlgo).update(salt + password).digest('hex');

	return {
		'X-Salt': "" + salt,
		'X-Hash': hashAlgo,
		'X-Key': hashKey,
		'X-User': usuario
	}

}

export default function useSapApiCall({ baseUrl, usuario, password }) {

	let { get, post } = useApiCall(baseUrl);

	const sapGetAlbaran = useCallback(async (vbeln) => {

		let opciones = {
			headers: {
				...calcularCabecerasSap(usuario, password)
			}
		}

		let resultado = await get('/zsd_infovblen/' + vbeln, opciones)
		return await resultado.json();

	}, [get, usuario, password]);


	const sapVerificaMateriales = useCallback(async (vbeln, werks, posiciones) => {

		let promesas = [];
		const POSICIONES_POR_TANDA = 20;

		for (let i = 0; i < posiciones.length; i = i + POSICIONES_POR_TANDA) {
			let opciones = {
				headers: {
					...calcularCabecerasSap(usuario, password),
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					vbeln: vbeln,
					werks: werks,
					s_positions: posiciones.slice(i, i + POSICIONES_POR_TANDA).map(pos => {
						return {
							matnr: '0' + pos.ean,
							charg: pos.lote,
							vfdat: '20' + pos.caducidad, // El efecto 2100 nos va a matar
							serial: pos.serie,
							check_emvo: pos.pendienteVerificar
						}
					})
				})
			}

			promesas.push( post('/zsd_checkvblen', null, opciones).then(resultado => resultado.json()) )

		}

		let resultados = await Promise.all(promesas);
		let posicionesResultantes = [];

		resultados.forEach(resultado => {
			if (resultado.s_positions) {
				resultado.s_positions.forEach(posicion => {
					posicionesResultantes.push(posicion);
				})
			}
		})

		return {
			vbeln: vbeln,
			werks: werks,
			s_positions: posicionesResultantes
		}


	}, [post, usuario, password])


	return {
		sapGetAlbaran,
		sapVerificaMateriales
	}
}