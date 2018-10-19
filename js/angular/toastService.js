export default class ToastService {
	constructor() {
		this.defaultToastSettings = {
			class: 'myToast',
			position: 'topRight',
			titleSize: 20,
			messageSize: 20,
			imageWidth: 100,
			icon: ''
		};
	}

	successToast(title, message, duration = 6000) {
		iziToast.success(
			Object.assign(this.defaultToastSettings, {
				title,
				message,
				timeout: duration,
				image: "assets/toastIcons/success.svg"
			})
		);
	}

	errorToast(title, message, duration = 6000) {
		iziToast.error(
			Object.assign(this.defaultToastSettings, {
				title,
				message,
				timeout: duration,
				image: "assets/toastIcons/error.svg"
			})
		);
	}
}