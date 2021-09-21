
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
			{posiciones.map((posicion, i) => {
				// Agregamos los materiales por los EAN admitidos
				let leidos = posicion.codigosMaterialAdmitidos.reduce( (a, v) => {
					return a + (lecturas[v]?.[posicion.charg] || 0)
				}, 0)

				return <PosicionAlbaran
					key={i}
					ean={posicion.matnr}
					cn={posicion.bismt}
					eanAdmitidos={posicion.codigosMaterialAdmitidos}
					descripcion={posicion.arktx}
					lote={posicion.charg}
					caducidad={posicion.vfdat}
					cantidad={posicion.lfimg}
					leidos={leidos}
				/>
			})}
		</Box>
	</Container>

}

