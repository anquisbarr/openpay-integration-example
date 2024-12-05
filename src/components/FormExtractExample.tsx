import type React from "react";
import { useState } from "react";
import {
  createOpenPay,
  type Token,
  type OpenPayError,
  type Card,
  type CardFieldStatus,
  type FieldStatusRecord,
} from "openpay-react-integration";

const openPay = createOpenPay({
  merchantId: "m09tnznpnhvlxyfnmbvd",
  publicKey: "pk_d9e88dcaa98c4befbb9b7cdbaa9aa487",
  isSandbox: true,
});

const FormExtractExample: React.FC = () => {
  const [token, setToken] = useState<Token | null>(null);
  const [error, setError] = useState<OpenPayError | null>(null);
  const [fieldStatus, setFieldStatus] = useState<Partial<FieldStatusRecord>>({});

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    additionalValue?: string
  ) => {
    const { name, value } = e.target;
    const status = openPay.card.fields.validateField(
      name as keyof Card,
      value,
      additionalValue
    );
    setFieldStatus(prev => ({ ...prev, [name]: status }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    try {
      const form = e.currentTarget;
      const extractedData = openPay.getFormCardInformation(form);
      const validation = openPay.card.validateCard(extractedData as Card);

      if (!validation.isValid) {
        setError({
          message: "Invalid card data",
          data: {
            description: Object.entries(validation.errors)
              .filter(([, hasError]) => hasError)
              .map(([field]) => `Invalid ${field}`)
              .join(", "),
            category: "validation",
            error_code: 400,
            http_code: 400,
            request_id: "validation-error",
          },
          status: 400,
        });
        return;
      }

      const token = await openPay.createTokenFromForm(form);
      setToken(token);

      const deviceSessionId = openPay.getDeviceSessionId();
      console.log("Payment data ready:", {
        tokenId: token.data.id,
        deviceSessionId,
        cardType: fieldStatus.card_number?.cardType,
      });
    } catch (err) {
      console.error("Payment failed:", err);
      setError(err as OpenPayError);
    }
  };

  const getCardTypeStyles = (status?: CardFieldStatus) => {
    if (!status?.cardType) return "bg-gray-100 text-gray-600";

    const styleMap: Record<string, string> = {
      visa: "bg-blue-900 text-white",
      mastercard: "bg-red-600 text-white",
      american_express: "bg-blue-500 text-white",
      discover: "bg-orange-500 text-white",
      diners_club: "bg-slate-800 text-white",
      visa_electron: "bg-blue-700 text-white",
      maestro: "bg-indigo-600 text-white",
    };

    return styleMap[status.cardType] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">OpenPay Form Example</h2>

      <form id="openpay-payment-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Card Number */}
        <div>
          {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
          <label className="block text-sm font-medium text-gray-700">
            Card Number
            {fieldStatus.card_number?.cardType && (
              <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ml-2 ${
                getCardTypeStyles(fieldStatus.card_number)
              }`}>
                {fieldStatus.card_number.cardType.toUpperCase()}
              </span>
            )}
          </label>
          <input
            name="card_number"
            data-openpay-card="card_number"
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-offset-2 ${
              fieldStatus.card_number?.isValid
                ? "border-green-300 focus:ring-green-500"
                : "border-gray-300 focus:ring-indigo-500"
            }`}
            placeholder="4111111111111111"
            maxLength={16}
            onChange={(e) => handleFieldChange(e)}
          />
          {fieldStatus.card_number?.message && (
            <p className={`mt-1 text-sm ${
              fieldStatus.card_number.isValid ? "text-green-600" : "text-red-600"
            }`}>
              {fieldStatus.card_number.message}
            </p>
          )}
        </div>

        {/* Holder Name */}
        <div>
          {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
          <label className="block text-sm font-medium text-gray-700">
            Holder Name
          </label>
          <input
            name="holder_name"
            data-openpay-card="holder_name"
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-offset-2 ${
              fieldStatus.holder_name?.isValid
                ? "border-green-300 focus:ring-green-500"
                : "border-gray-300 focus:ring-indigo-500"
            }`}
            placeholder="JOHN DOE"
            onChange={(e) => handleFieldChange(e)}
          />
          {fieldStatus.holder_name?.message && (
            <p className={`mt-1 text-sm ${
              fieldStatus.holder_name.isValid ? "text-green-600" : "text-red-600"
            }`}>
              {fieldStatus.holder_name.message}
            </p>
          )}
        </div>

        {/* Expiration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
            <label className="block text-sm font-medium text-gray-700">
              Expiration Month
            </label>
            <input
              name="expiration_month"
              data-openpay-card="expiration_month"
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ${
                fieldStatus.expiration_month?.isValid
                  ? "border-green-300"
                  : "border-gray-300"
              }`}
              placeholder="12"
              maxLength={2}
              onChange={(e) => handleFieldChange(e, fieldStatus.expiration_year?.value)}
            />
          </div>
          <div>
            {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
            <label className="block text-sm font-medium text-gray-700">
              Expiration Year
            </label>
            <input
              name="expiration_year"
              data-openpay-card="expiration_year"
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ${
                fieldStatus.expiration_year?.isValid
                  ? "border-green-300"
                  : "border-gray-300"
              }`}
              placeholder="25"
              maxLength={2}
              onChange={(e) => handleFieldChange(e, fieldStatus.expiration_month?.value)}
            />
          </div>
          {(fieldStatus.expiration_month?.message || fieldStatus.expiration_year?.message) && (
            <div className="col-span-2">
              <p className="text-sm text-red-600">
                {fieldStatus.expiration_month?.message || fieldStatus.expiration_year?.message}
              </p>
            </div>
          )}
        </div>

        {/* CVV */}
        <div>
          {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
          <label className="block text-sm font-medium text-gray-700">CVV</label>
          <input
            name="cvv2"
            data-openpay-card="cvv2"
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm ${
              fieldStatus.cvv2?.isValid
                ? "border-green-300"
                : "border-gray-300"
            }`}
            placeholder="123"
            maxLength={4}
            onChange={(e) => handleFieldChange(e, fieldStatus.card_number?.value)}
          />
          {fieldStatus.cvv2?.message && (
            <p className={`mt-1 text-sm ${
              fieldStatus.cvv2.isValid ? "text-green-600" : "text-red-600"
            }`}>
              {fieldStatus.cvv2.message}
            </p>
          )}
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <p className="text-sm text-red-700">
              {error.message}
              {error.data?.description && <>: {error.data.description}</>}
            </p>
          </div>
        )}

        {token && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4">
            <p className="text-sm text-green-700">
              Token created successfully: {token.data.id}
            </p>
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
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-600">Device Session ID</h4>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
              {openPay.getDeviceSessionId()}
            </pre>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600">Field Status</h4>
            <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
              {JSON.stringify(fieldStatus, null, 2)}
            </pre>
          </div>
          {token && (
            <div>
              <h4 className="text-sm font-medium text-gray-600">Token Response</h4>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
                {JSON.stringify(token, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FormExtractExample;