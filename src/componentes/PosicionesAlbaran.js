
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
				let leidos = posicion.codigosMaterialAdmitidos.reduce((a, ean) => {
					if (posicion.charg === '*') {
						if (!lecturas[ean]) return a;
						console.log(Object.values(lecturas[ean]))
						let totalLecturas = Object.values(lecturas[ean]).reduce((a, cantidad) => a + cantidad, 0)
						return a + (totalLecturas || 0)
					} else {
						return a + (lecturas[ean]?.[posicion.charg] || 0)
					}
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

