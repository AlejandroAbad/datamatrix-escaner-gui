import { AppBar, Button, Icon, makeStyles, Toolbar, Typography } from "@material-ui/core";
import { UsbRounded } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
	root: {
		flexGrow: 1,
	},
	menuButton: {
		marginRight: theme.spacing(2),
	},
	title: {
		flexGrow: 1,
	},
}));

export default function BarraSuperior({
	vbeln,
	werks,
	onCerrar
}) {

	const classes = useStyles();

	return (<AppBar position="static">
		<Toolbar>
			<Icon edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
				<UsbRounded />
			</Icon>

			{vbeln ?
				<Typography variant="h6" className={classes.title}>
					Leyendo Orden de entrega {vbeln} en {werks}
				</Typography>
				:
				<Typography variant="h6" className={classes.title}>
					Escáner Datamatrix
				</Typography>
			}

			<Button color="inherit">Opciones</Button>
			{vbeln && <Button color="inherit" onClick={onCerrar}>Salir</Button>}

		</Toolbar>
	</AppBar>)


}