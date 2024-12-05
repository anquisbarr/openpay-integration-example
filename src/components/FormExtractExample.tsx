import type React from "react";
import { useState } from "react";
import {
  createOpenPay,
  type Token,
  type OpenPayError,
  type Card,
  type CardFieldStatus,
  type FieldStatusRecord,
  openPayUtils,
} from "openpay-react-integration";
import { Iconoir } from 'iconoir-react';

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
      const extractedData = await openPay.getFormCardInformation(form);
      const validation = openPayUtils.validators.card(extractedData);

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Payment Form */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">OpenPay Payment Demo</h2>
            <p className="mt-2 text-indigo-100">Enter your card details securely</p>
          </div>

          <div className="px-8 py-6">
            <form id="openpay-payment-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Card Number */}
              <div>
                <label htmlFor="card_number" className="block text-sm font-semibold text-gray-700 mb-2">
                  Card Number
                  {fieldStatus.card_number?.cardType && (
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ml-2 ${
                      getCardTypeStyles(fieldStatus.card_number)
                    }`}>
                      {fieldStatus.card_number.cardType.toUpperCase()}
                    </span>
                  )}
                </label>
                <input
                  id="card_number"
                  name="card_number"
                  data-openpay-card="card_number"
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors duration-200 ease-in-out focus:outline-none ${
                    fieldStatus.card_number?.isValid
                      ? "border-green-400 focus:border-green-500"
                      : "border-gray-200 focus:border-indigo-500"
                  }`}
                  placeholder="4111 1111 1111 1111"
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
                <label htmlFor="holder_name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Holder Name
                </label>
                <input
                  id="holder_name"
                  name="holder_name"
                  data-openpay-card="holder_name"
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors duration-200 ease-in-out focus:outline-none ${
                    fieldStatus.holder_name?.isValid
                      ? "border-green-400 focus:border-green-500"
                      : "border-gray-200 focus:border-indigo-500"
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

              {/* Expiration Date and CVV */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label htmlFor="expiration_month" className="block text-sm font-semibold text-gray-700 mb-2">
                    Month
                  </label>
                  <input
                    id="expiration_month"
                    name="expiration_month"
                    data-openpay-card="expiration_month"
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors duration-200 ease-in-out focus:outline-none ${
                      fieldStatus.expiration_month?.isValid
                        ? "border-green-400"
                        : "border-gray-200"
                    }`}
                    placeholder="MM"
                    maxLength={2}
                    onChange={(e) => handleFieldChange(e, fieldStatus.expiration_year?.value)}
                  />
                </div>
                <div className="col-span-1">
                  <label htmlFor="expiration_year" className="block text-sm font-semibold text-gray-700 mb-2">
                    Year
                  </label>
                  <input
                    id="expiration_year"
                    name="expiration_year"
                    data-openpay-card="expiration_year"
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors duration-200 ease-in-out focus:outline-none ${
                      fieldStatus.expiration_year?.isValid
                        ? "border-green-400"
                        : "border-gray-200"
                    }`}
                    placeholder="YY"
                    maxLength={2}
                    onChange={(e) => handleFieldChange(e, fieldStatus.expiration_month?.value)}
                  />
                </div>
                <div className="col-span-1">
                  <label htmlFor="cvv2" className="block text-sm font-semibold text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    id="cvv2"
                    name="cvv2"
                    data-openpay-card="cvv2"
                    className={`w-full px-4 py-3 rounded-lg border-2 transition-colors duration-200 ease-in-out focus:outline-none ${
                      fieldStatus.cvv2?.isValid
                        ? "border-green-400"
                        : "border-gray-200"
                    }`}
                    placeholder="123"
                    maxLength={4}
                    onChange={(e) => handleFieldChange(e, fieldStatus.card_number?.value)}
                  />
                </div>
              </div>

              {/* Error and Success Messages */}
              {error && (
                <div className="rounded-lg bg-red-50 p-4 border-l-4 border-red-400">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Iconoir name="exclamation-triangle" className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">
                        {error.message}
                        {error.data?.description && <>: {error.data.description}</>}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {token && (
                <div className="rounded-lg bg-green-50 p-4 border-l-4 border-green-400">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Iconoir name="check-circle" className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        Payment processed successfully
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-800 text-white py-3 px-4 rounded-lg font-medium hover:from-indigo-700 hover:to-indigo-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Process Payment
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - Debug Information */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 text-black">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Debug Information</h3>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Device Session ID</h4>
              <pre className="bg-white/90 p-4 rounded-lg text-sm overflow-auto border border-indigo-100">
                {openPay.getDeviceSessionId()}
              </pre>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Field Status</h4>
              <pre className="bg-white/90 p-4 rounded-lg text-sm overflow-auto border border-indigo-100 max-h-[400px]">
                {JSON.stringify(fieldStatus, null, 2)}
              </pre>
            </div>
            
            {token && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Token Response</h4>
                <pre className="bg-white/90 p-4 rounded-lg text-sm overflow-auto border border-indigo-100">
                  {JSON.stringify(token, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormExtractExample;