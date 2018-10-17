export default class ToastService {
	constructor() {

	}

	successToast(title, message, duration = 6000) {
		iziToast.success({
			class: 'myToast',
		    title,
		    message,
			position: 'topRight',
			timeout: duration,
			titleSize: 20,
			messageSize: 20,
			image: "assets/toastIcons/success.svg",
			imageWidth: 150,
			icon: ''
		});
	}

	errorToast(title, message, duration = 6000) {
		iziToast.error({
			class: 'myToast',
		    title,
		    message,
			position: 'topRight',
			timeout: duration,
			titleSize: 20,
			messageSize: 20,
			image: "assets/toastIcons/error.svg",
			imageWidth: 150,
			icon: ''
		});
	}
}