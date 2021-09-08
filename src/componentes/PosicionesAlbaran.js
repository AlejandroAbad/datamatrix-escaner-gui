
import { Box, Container, makeStyles } from "@material-ui/core";
import PosicionAlbaran from "./PosicionAlbaran";

const useStyles = makeStyles((theme) => ({
	box: {
		marginTop: theme.spacing(4)
	}
}));

export default function PosicionesAlbaran({ posiciones, lecturas }) {

	let classes = useStyles();

	return <Container>
		<Box className={classes.box}>
			{posiciones.map((posicion, i) => <PosicionAlbaran
				key={i}
				ean={posicion.matnr}
				cn={posicion.bismt}
				descripcion={posicion.arktx}
				lote={posicion.charg}
				caducidad={posicion.vfdat}
				cantidad={posicion.lfimg}
				leidos={lecturas[parseInt(posicion.matnr)]?.[posicion.charg] || 0}
			/>)}
		</Box>
	</Container>

}

