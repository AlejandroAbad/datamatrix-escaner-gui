import { makeStyles } from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";

const useStyles = makeStyles((theme) => ({
	alert: {
		marginBottom: theme.spacing(1)
	},
}));

export default function ErrorLectura({ error }) {

	let classes = useStyles();

	return (<Alert severity="error" className={classes.alert} >
		<AlertTitle><strong>{error}</strong></AlertTitle>
	</Alert>
	);
}