export default class ToastService {
	constructor($compile) {
		this.defaultToastSettings = {
			class: 'myToast',
			position: 'topRight',
			titleSize: 20,
			messageSize: 20,
			imageWidth: 100,
			icon: ''
		};
	}

	successToast(title, message, duration = 6000, id = null, onOpening = (() => {})) {
		iziToast.success(
			Object.assign(this.defaultToastSettings, {
				id,
				title,
				message,
				timeout: duration,
				image: 'assets/toastIcons/success.svg',
				onOpening
			})
		);
	}

	errorToast(title, message, duration = 6000, id = null, onOpening = (() => {})) {
		iziToast.error(
			Object.assign(this.defaultToastSettings, {
				id,
				title,
				message,
				timeout: duration,
				image: 'assets/toastIcons/error.svg',
				onOpening
			})
		);
	}

	infoToast(title, message, duration = 6000, id = null, onOpening = (() => {})) {
		iziToast.info(
			Object.assign(this.defaultToastSettings, {
				id,
				title,
				message,
				timeout: duration,
				//image: 'assets/toastIcons/error.svg',
				onOpening
			})
		);
	}
}