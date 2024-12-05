import React from "react";
import {
	createOpenPay,
	type Token,
	type OpenPayError,
} from "openpay-react-integration";

const openPay = createOpenPay({
	merchantId: "m09tnznpnhvlxyfnmbvd",
	publicKey: "pk_d9e88dcaa98c4befbb9b7cdbaa9aa487",
	isSandbox: true,
});

const FormExtractExample: React.FC = () => {
	const [token, setToken] = React.useState<Token | null>(null);
	const [error, setError] = React.useState<OpenPayError | null>(null);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);

		try {
			// Get form data using OpenPay's extraction
			const form = e.currentTarget;
			const extractedData = await openPay.getFormCardInformation(form);
			console.log("Extracted form data:", extractedData);

			const validation = await openPay.card.validateCard(extractedData);
			if (!validation.isValid) {
				setError({
					message: "Card validation failed",
					data: {
						description: validation.errors ? 
							Object.entries(validation.errors)
								.filter(([, hasError]) => hasError)
								.map(([field]) => `Invalid ${field}`)
								.join(", ") 
							: "Invalid card data",
						category: "validation",
						error_code: 400,
						http_code: 400,
						request_id: "validation-error",
					},
					status: 400,
				});
				return;
			}

			// Create token directly from form
			const token = await openPay.createTokenFromForm(form);
			setToken(token);

			// Get device session ID for backend processing
			const deviceSessionId = openPay.getDeviceSessionId();

			console.log("Payment data ready:", {
				tokenId: token.data.id,
				deviceSessionId,
			});

			// Here you would send to your backend
		} catch (err) {
			console.error("Payment failed:", err);
			setError(err as OpenPayError);
		}
	};

	return (
		<div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
			<h2 className="text-xl font-bold mb-4">OpenPay Form Example</h2>

			<form
				id="openpay-payment-form"
				onSubmit={handleSubmit}
				className="space-y-4"
			>
				{/* Card Number */}
				<div>
					{/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
					<label className="block text-sm font-medium text-gray-700">
						Card Number
					</label>
					<input
						data-openpay-card="card_number"
						className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
						placeholder="4111111111111111"
						maxLength={16}
					/>
				</div>

				{/* Holder Name */}
				<div>
					{/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
					<label className="block text-sm font-medium text-gray-700">
						Holder Name
					</label>
					<input
						data-openpay-card="holder_name"
						className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
						placeholder="JOHN DOE"
					/>
				</div>

				{/* Expiration */}
				<div className="grid grid-cols-2 gap-4">
					<div>
						{/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
						<label className="block text-sm font-medium text-gray-700">
							Expiration Month
						</label>
						<input
							data-openpay-card="expiration_month"
							className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
							placeholder="12"
							maxLength={2}
						/>
					</div>
					<div>
						{/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
						<label className="block text-sm font-medium text-gray-700">
							Expiration Year
						</label>
						<input
							data-openpay-card="expiration_year"
							className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
							placeholder="25"
							maxLength={2}
						/>
					</div>
				</div>

				{/* CVV */}
				<div>
					{/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
					<label className="block text-sm font-medium text-gray-700">CVV</label>
					<input
						data-openpay-card="cvv2"
						className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
						placeholder="123"
						maxLength={4}
					/>
				</div>

				{/* Error Display */}
				{error && (
					<div className="bg-red-50 border-l-4 border-red-400 p-4">
						<div className="flex">
							<div className="ml-3">
								<p className="text-sm text-red-700">
									{error.message}
									{error.data?.description && <>: {error.data.description}</>}
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Success Display */}
				{token && (
					<div className="bg-green-50 border-l-4 border-green-400 p-4">
						<div className="flex">
							<div className="ml-3">
								<p className="text-sm text-green-700">
									Token created successfully: {token.data.id}
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Submit Button */}
				<button
					type="submit"
					className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
				>
					Process Payment
				</button>
			</form>

			{/* Debug Information */}
			<div className="mt-8">
				<h3 className="text-lg font-medium mb-2">Debug Information</h3>
				<pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
					{token && JSON.stringify(token, null, 2)}
				</pre>
			</div>
		</div>
	);
};

export default FormExtractExample;
