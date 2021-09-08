
import { Avatar, Button, IconButton, LinearProgress, List, ListItem, ListItemAvatar, ListItemText, makeStyles, Paper, Toolbar, Typography } from "@material-ui/core";
import { BugReport } from "@material-ui/icons";
import ErrorLectura from "./ErrorLectura";

const useStyles = makeStyles((theme) => ({
	root: {
		width: '100%',
		'& > * + *': {
			marginTop: theme.spacing(2),
		},
	},
	box: {
		marginTop: theme.spacing(4),
		marginRight: theme.spacing(4)
	},
	title: {
		flexGrow: 1,
	},
	barraError: {
		borderBottomColor: theme.palette.secondary.main,
		borderBottomStyle: 'solid',
		borderBottomWidth: theme.spacing(0.4),
		marginBottom: theme.spacing(2)
	},
	paper: {
		padding: theme.spacing(4),
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
	},
	paper2: {
		padding: theme.spacing(2),
	},
	titulo: {
		marginBottom: theme.spacing(2),
	},
	listaLecturasCorrectas: {
		padding: 0
	},
	pelota: {
		color: theme.palette.primary.contrastText,
		backgroundColor: theme.palette.primary.main,
	},
}));


export default function EstadoLectura({ errores, limpiarErrores, verificando, ultimasVerificadas }) {

	let classes = useStyles();


	let resumen = [];

	for (let ean in ultimasVerificadas) {
		for (let lote in ultimasVerificadas[ean]) {
			resumen.push({
				ean, lote, cantidad: ultimasVerificadas[ean][lote]
			})
		}
	}

	return <div className={classes.box}>

		{verificando > 0 ?
			<Paper className={classes.paper} variant="outlined" square>
				<Typography component="h1" variant="h5" className={classes.titulo}>
					Verificando {verificando} entrada{verificando > 1 && 's'}
				</Typography>
				<div className={classes.root}>
					<LinearProgress color="secondary" />
				</div>
			</Paper>
			:
			<>
				<Paper className={classes.paper} variant="outlined" square>
					<Typography component="h1" variant="h5" className={classes.titulo}>
						Esperando nuevas lecturas
					</Typography>
					<div className={classes.root}>
						<LinearProgress variant="buffer" value={0} valueBuffer={0} />
					</div>
				</Paper>
				{
					resumen.length > 0 &&
					<Paper className={classes.paper2} variant="outlined" square>
						<Typography component="h1" variant="h6" className={classes.titulo2}>
							Última lectura correcta
						</Typography>
						<List className={classes.listaLecturasCorrectas} component="nav">
							{
								resumen.map((lectura, i) => <ListItem key={i}>
									<ListItemAvatar>
										<Avatar className={classes.pelota}>
											{lectura.cantidad}
										</Avatar>
									</ListItemAvatar>
									<ListItemText primary={lectura.ean} secondary={lectura.lote} />
								</ListItem>)
							}
						</List>
					</Paper>
				}
			</>
		}

		{errores.length === 0 ||

			<Toolbar disableGutters variant="dense" className={classes.barraError}>
				<IconButton edge="start" color="secondary">
					<BugReport />
				</IconButton>
				<Typography variant="h5" className={classes.title} color="secondary">
					Errores
				</Typography>
				<Button variant="outlined" color="secondary" onClick={limpiarErrores}>Limpiar errores</Button>
			</Toolbar>

		}
		{errores.map((error, i) => <ErrorLectura
			key={i}
			error={error}
		/>)}
	</div>
}

