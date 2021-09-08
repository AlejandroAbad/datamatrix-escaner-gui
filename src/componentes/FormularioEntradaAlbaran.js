import {useRef, useCallback} from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';


const useStyles = makeStyles((theme) => ({
	paper: {
		marginTop: theme.spacing(8),
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.secondary.main,
	},
	form: {
		width: '100%',
		marginTop: theme.spacing(3),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
}));


export default function FormularioEntradaAlbaran({ onAlbaranCambiado }) {

	const classes = useStyles();

	const refInputAlbaran = useRef();
	const establecerAlbaran = useCallback( () => {
		if (refInputAlbaran.current?.value)
			onAlbaranCambiado(refInputAlbaran.current?.value);

	}, [refInputAlbaran, onAlbaranCambiado])

	return (
		<Container component="main" maxWidth="xs">
			<CssBaseline />
			<div className={classes.paper}>
				<Typography component="h1" variant="h4">
					Escáner Datamatrix
				</Typography>
				<form className={classes.form} noValidate>
					<TextField
						variant="outlined"
						fullWidth
						label="Número de albarán"
						id="vbeln" name="vbeln" autoComplete="vbeln"
						inputRef={refInputAlbaran}
					/>
					<Button fullWidth variant="contained" color="primary" className={classes.submit} onClick={establecerAlbaran}>
						Comenzar
					</Button>

				</form>
			</div>
		</Container>
	)

}