import type React from "react";
import { useState } from "react";
import {
	type Card,
	type CardValidationResult,
	createOpenPay,
} from "openpay-react";

// Create the client
const openPay = createOpenPay({
	merchantId: "m09tnznpnhvlxyfnmbvd",
	publicKey: "pk_d9e88dcaa98c4befbb9b7cdbaa9aa487",
	isSandbox: true,
});

const App: React.FC = () => {
	const [cardData, setCardData] = useState<Card>({
		card_number: "",
		holder_name: "",
		expiration_year: "",
		expiration_month: "",
		cvv2: "",
	});

	const [validationResult, setValidationResult] =
		useState<CardValidationResult>({
			isValid: false,
			errors: {},
			cardType: undefined,
		});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validate card using the new validateCard method
		const validation = openPay.card.validateCard(cardData);
		setValidationResult(validation);

		if (!validation.isValid) {
			console.error("Validation errors:", validation.errors);
			return;
		}

		try {
			const token = await openPay.createToken(cardData);
			console.log("Token:", token);

			// Send to your backend with device session id
			const deviceSessionId = openPay.getDeviceSessionId();
			console.log("Sending to your backend...", {
				tokenId: token.data.id,
				deviceSessionId,
			});
		} catch (error) {
			console.error("Payment failed:", error);
		}
	};

	// Function to show field-specific error messages
	const getErrorMessage = (fieldName: keyof typeof validationResult.errors) => {
		if (validationResult.errors[fieldName]) {
			switch (fieldName) {
				case "cardNumber":
					return "Invalid card number";
				case "cvv":
					return "Invalid CVV";
				case "expiry":
					return "Invalid expiration date";
				case "holderName":
					return "Invalid holder name";
				default:
					return "Invalid field";
			}
		}
		return "";
	};

	return (
		<form
			onSubmit={handleSubmit}
			id="openpay-payment-form"
			style={{
				display: "flex",
				flexDirection: "column",
				gap: 10,
				maxWidth: "300px",
			}}
		>
			<div>
				<input
					name="card_number"
					placeholder="Card Number"
					value={cardData.card_number}
					onChange={(e) => {
						const value = e.target.value;
						setCardData((prev: Card) => ({ ...prev, card_number: value }));

						// Real-time validation
						const isValid = openPay.card.validateNumber(cardData.card_number);
						const cardType = openPay.card.getType(cardData.card_number);
						console.log("Card valid:", isValid, "Type:", cardType);
					}}
				/>
				{validationResult.cardType && (
					<span>Card Type: {validationResult.cardType}</span>
				)}
				{getErrorMessage("cardNumber") && (
					<div style={{ color: "red" }}>{getErrorMessage("cardNumber")}</div>
				)}
			</div>

			<div>
				<input
					name="holder_name"
					placeholder="Name"
					value={cardData.holder_name}
					onChange={(e) =>
						setCardData((prev: Card) => ({
							...prev,
							holder_name: e.target.value,
						}))
					}
				/>
				{getErrorMessage("holderName") && (
					<div style={{ color: "red" }}>{getErrorMessage("holderName")}</div>
				)}
			</div>

			<div style={{ display: "flex", gap: 10 }}>
				<div>
					<input
						name="expiration_month"
						placeholder="MM"
						maxLength={2}
						value={cardData.expiration_month}
						onChange={(e) =>
							setCardData((prev: Card) => ({
								...prev,
								expiration_month: e.target.value,
							}))
						}
					/>
				</div>
				<div>
					<input
						name="expiration_year"
						placeholder="YY"
						maxLength={2}
						value={cardData.expiration_year}
						onChange={(e) =>
							setCardData((prev: Card) => ({
								...prev,
								expiration_year: e.target.value,
							}))
						}
					/>
				</div>
			</div>
			{getErrorMessage("expiry") && (
				<div style={{ color: "red" }}>{getErrorMessage("expiry")}</div>
			)}

			<div>
				<input
					name="cvv2"
					placeholder="CVV2"
					maxLength={4}
					value={cardData.cvv2}
					onChange={(e) =>
						setCardData((prev: Card) => ({ ...prev, cvv2: e.target.value }))
					}
				/>
				{getErrorMessage("cvv") && (
					<div style={{ color: "red" }}>{getErrorMessage("cvv")}</div>
				)}
			</div>

			{!validationResult.isValid &&
				validationResult.errors &&
				Object.keys(validationResult.errors).length > 0 && (
					<div style={{ color: "red", marginTop: "10px" }}>
						Please correct the errors before submitting
					</div>
				)}

			<button type="submit" style={{ marginTop: "10px" }}>
				Pay
			</button>
		</form>
	);
};

export default App;
