import { Chip, Grid, makeStyles, Paper, Typography } from "@material-ui/core";


const useStyles = makeStyles((theme) => ({
	paper: {
		marginTop: theme.spacing(1),
		padding: theme.spacing(2, 4)
	},
	estados: {
		textAlign: "center"
	},
	chips: {
		'& > *': {
			margin: theme.spacing(0.5),
		},
	}
}));

export default function PosicionAlbaran({ ean, cn, descripcion, lote, caducidad, eanAdmitidos, cantidad, leidos }) {

	let classes = useStyles();

	return (
		<Paper className={classes.paper} variant="outlined" square>
			<Grid container>
				<Grid item xs={12} sm={8}>
					<Typography component="h2" variant="h6" color="primary" >
						{descripcion}
					</Typography>
					<Typography variant="subtitle1" display="block" color="textSecondary">
						Lote/Cad: <Chip size="small" label={lote} variant="outlined" color="secondary" />
						<Chip size="small" label={caducidad} variant="outlined" color="secondary" />
					</Typography>
					<Typography variant="subtitle1" display="block" color="textSecondary">
						Códigos admitidos:
					</Typography>
					<Typography variant="subtitle1" display="block" color="textSecondary">
						{eanAdmitidos.map(ean => <Chip key={ean} size="small" label={ean} variant="outlined" color="primary" />)}
					</Typography>
				</Grid>
				<Grid item xs={12} sm={4} className={classes.estados}>
					<Grid container>
						<Grid item xs={6}>
							<Typography component="h2" variant="h6" display="block">
								Cantidad
							</Typography>
							<Typography component="h2" variant="h5" display="block">
								<b>{cantidad}</b>
							</Typography>
						</Grid>
						<Grid item xs={6}>
							<Typography component="h2" variant="h6" display="block">
								Leídos
							</Typography>
							<Typography component="h2" variant="h5" display="block">
								<b>{leidos}</b>
							</Typography>
						</Grid>
					</Grid>
				</Grid>
			</Grid>
		</Paper>
	);
}