import { useCallback } from 'react';

export const useApiCall = (baseUrl) => {

	const _ejecutarConsulta = useCallback((opciones) => {

		if (!opciones) opciones = {};

		if (!opciones.url) opciones.url = baseUrl;
		else opciones.url = baseUrl + opciones.url;

		let { url, ...opcionesHttp } = opciones;

/*
		console.group('EJECUTANDO CONSULTA ' + url);
		console.log('URL', url);
		console.log('OPCIONES', opcionesHttp);
		console.groupEnd();
*/
		opciones.mode = 'cors';
		return fetch(url, opcionesHttp);

	}, [baseUrl])


	const get = useCallback((path, opciones = {}) => {
		let parametros = {
			...opciones,
			url: path,
			method: 'get'
		}
		return _ejecutarConsulta(parametros);
	}, [_ejecutarConsulta]);

	const post = useCallback((path, data, opciones) => {
		let parametros = {
			...opciones,
			url: path,
			method: 'post',
			body: data || opciones.body
		}
		return _ejecutarConsulta(parametros);
	}, [_ejecutarConsulta]);

	const put = useCallback((path, data, opciones) => {
		let parametros = {
			...opciones,
			url: path,
			method: 'put',
			body: data || opciones.body
		}
		return _ejecutarConsulta(parametros);
	}, [_ejecutarConsulta]);

	const del = useCallback((path, opciones) => {
		let parametros = {
			...opciones,
			url: path,
			method: 'delete'
		}
		return _ejecutarConsulta(parametros);
	}, [_ejecutarConsulta]);


	return {
		get, post, put, del
	}

}



