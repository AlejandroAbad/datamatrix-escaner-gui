import { CircularProgress, Container, CssBaseline, makeStyles, Typography } from "@material-ui/core";


const useStyles = makeStyles((theme) => ({
	paper: {
		marginTop: theme.spacing(8),
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
	},
	titulo: {
		marginBottom: theme.spacing(2),
	}
}));

export default function PantallaError() {

	let classes = useStyles();

	return (
		<Container component="main" maxWidth="xs">
			<CssBaseline />
			<div className={classes.paper}>

				<Typography component="h1" variant="h4" className={classes.titulo}>
					Consultando datos a SAP
				</Typography>

				<CircularProgress />
			</div>
		</Container>

	);
}