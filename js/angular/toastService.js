export default class ToastService {
	constructor() {

	}

	successToat(title, message) {
		iziToast.success({
			class: 'myToast',
		    title,
		    message,
			position: 'topRight',
			timeout: 6000,
			titleSize: 20,
			messageSize: 20,
			image: "assets/toastIcons/success.svg",
			imageWidth: 150,
			icon: ''
		});
	}

	errorToat(title, message) {
		iziToast.error({
			class: 'myToast',
		    title,
		    message,
			position: 'topRight',
			timeout: 6000,
			titleSize: 20,
			messageSize: 20,
			image: "assets/toastIcons/error.svg",
			imageWidth: 150,
			icon: ''
		});
	}
}