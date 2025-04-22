"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import OrderSummary from "./order-summary"
import { useCartStore } from "@/store/cart-store"
import { useCheckoutStore } from "@/store/checkout-store"
import PaymentSection from "./payment-section"

export default function CheckoutForm() {
  const { data: session } = useSession()
  const router = useRouter()
  const { items, clearCart } = useCartStore()
  const { setOrderDetails } = useCheckoutStore()
  const [savedAddresses, setSavedAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [selectedPaymentOption, setSelectedPaymentOption] = useState(null)
  const [error, setError] = useState(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm()
  console.log(session?.user);
  
  // Populate user information when session is available
  useEffect(() => {
    if (session?.user) {
      setValue("firstName", session.user.firstName || "")
      setValue("lastName", session.user.lastName || "")
      setValue("emailAddress", session.user.email || "")
    }
  }, [session, setValue])

  // Fetch user's saved addresses if logged in
  useEffect(() => {
    async function fetchAddresses() {
      if (session?.user) {
        try {
          const response = await fetch("/api/user/addresses")
          const data = await response.json()
          if (data.success) {
            setSavedAddresses(data.addresses || [])
            // Set default address if available
            const defaultAddress = data.addresses?.find((addr) => addr.isDefault)
            if (defaultAddress) {
              setSelectedAddress(defaultAddress)
              populateAddressFields(defaultAddress)
            }
          }
        } catch (error) {
          console.error("Error fetching addresses:", error)
        }
      }
    }
    fetchAddresses()
  }, [session])

  // Populate form with selected address
  const populateAddressFields = (address) => {
    setValue("streetAddress", address.street || "")
    setValue("apartment", address.apartment || "")
    setValue("townCity", address.city || "")
    setValue("state", address.state || "")
    setValue("zipCode", address.zipCode || "")
    setValue("country", address.country || "")
    setValue("phoneNumber", address.phoneNumber || "")
  }

  // Handle address selection
  const handleAddressSelect = (address) => {
    setSelectedAddress(address)
    populateAddressFields(address)
  }

  // Calculate cart totals
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const shipping = subtotal > 100 ? 0 : 10 // Free shipping for orders over $100
    const total = subtotal + shipping
    return { subtotal, shipping, total }
  }

  // Handle form submission
  const onSubmit = async (data) => {
    // if (items.length === 0) {
    //   toast.error("Your cart is empty");
    //   setError("Your cart is empty");
    //   return;
    // }
  
    setIsSubmitting(true);
    setError(null);
  
    try {
      const { subtotal, shipping, total } = calculateTotals();
  
      const orderData = {
        items: items.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          image: item.image,
        })),
        shippingAddress: {
          firstName: data.firstName,
          lastName: data.lastName,
          street: data.streetAddress,
          apartment: data.apartment || "",
          city: data.townCity,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
          phoneNumber: data.phoneNumber,
          emailAddress: data.emailAddress,
        },
        paymentMethod: paymentMethod,
        paymentDetails: selectedPaymentOption ? { cardId: selectedPaymentOption._id } : null,
        subtotal,
        shipping,
        total,
        saveInfo: data.saveInfo,
      };
  
      console.log("Submitting order data:", JSON.stringify(orderData, null, 2));
  
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });
  
      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        console.error("Failed to parse JSON response:", jsonError);
        console.log("Raw response:", await response.text());
        throw new Error("Invalid server response");
      }
  
      console.log("Order API response:", result);
  
      if (result.success) {
        const orderDetailsData = {
          orderId: result.order._id,
          orderNumber: result.order.orderNumber,
          total: result.order.total,
          items: items,
          email: data.emailAddress,
        };
        console.log("Setting orderDetails:", orderDetailsData);
        setOrderDetails(orderDetailsData);
        console.log("Store state after set:", useCheckoutStore.getState().orderDetails);
  
        clearCart();
  
        await new Promise((resolve) => setTimeout(resolve, 100));
        router.push("/checkout/thank-you");
      } else {
        const errorMsg = result.message || "Failed to place order";
        setError(errorMsg);
        toast.error(errorMsg);
        console.error("API error:", result.error || result.message);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      const errorMsg = error.message || "An error occurred during checkout";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Billing Details Form */}
      <div>
        <h2 className="text-2xl font-semibold mb-6">Billing Details</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Saved Addresses Section (for logged in users) */}
        {session?.user && savedAddresses.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Your Addresses</h3>
            <div className="grid grid-cols-1 gap-3">
              {savedAddresses.map((address) => (
                <div
                  key={address._id}
                  className={`border p-3 rounded cursor-pointer hover:border-primary transition-colors ${
                    selectedAddress?._id === address._id ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => handleAddressSelect(address)}
                >
                  <div className="flex justify-between">
                    <p className="font-medium">
                      {address.street}
                      {address.isDefault && (
                        <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Default</span>
                      )}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">
                    {address.city}, {address.state} {address.zipCode}
                  </p>
                  <p className="text-sm text-gray-600">{address.country}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("firstName", { required: "First name is required" })}
                id="firstName"
                className="w-full p-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("lastName", { required: "Last name is required" })}
                id="lastName"
                className="w-full p-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              {...register("streetAddress", { required: "Street address is required" })}
              id="streetAddress"
              className="w-full p-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
            {errors.streetAddress && <p className="text-red-500 text-sm mt-1">{errors.streetAddress.message}</p>}
          </div>

          <div>
            <label htmlFor="apartment" className="block text-sm font-medium text-gray-700 mb-1">
              Apartment, suite, unit, etc. (optional)
            </label>
            <input
              {...register("apartment")}
              id="apartment"
              className="w-full p-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="townCity" className="block text-sm font-medium text-gray-700 mb-1">
                Town/City <span className="text-red-500">*</span>
              </label>
              <input
                {...register("townCity", { required: "Town/City is required" })}
                id="townCity"
                className="w-full p-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              {errors.townCity && <p className="text-red-500 text-sm mt-1">{errors.townCity.message}</p>}
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <input
                {...register("state", { required: "State is required" })}
                id="state"
                className="w-full p-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code <span className="text-red-500">*</span>
              </label>
              <input
                {...register("zipCode", { required: "ZIP code is required" })}
                id="zipCode"
                className="w-full p-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              {errors.zipCode && <p className="text-red-500 text-sm mt-1">{errors.zipCode.message}</p>}
            </div>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                {...register("country", { required: "Country is required" })}
                id="country"
                className="w-full p-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
              {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              {...register("phoneNumber", { required: "Phone number is required" })}
              id="phoneNumber"
              className="w-full p-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
            {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>}
          </div>

          <div>
            <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              {...register("emailAddress", {
                required: "Email address is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              id="emailAddress"
              className="w-full p-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
            {errors.emailAddress && <p className="text-red-500 text-sm mt-1">{errors.emailAddress.message}</p>}
          </div>

          {session?.user && (
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register("saveInfo")}
                id="saveInfo"
                className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="saveInfo" className="text-sm text-gray-700">
                Save this information for faster check-out next time
              </label>
            </div>
          )}

          {/* Payment Section */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Payment Method</h3>
            <PaymentSection
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              selectedPaymentOption={selectedPaymentOption}
              setSelectedPaymentOption={setSelectedPaymentOption}
            />
          </div>
        </form>
      </div>

      {/* Order Summary */}
      <div>
        <OrderSummary
          isSubmitting={isSubmitting}
          handleSubmit={handleSubmit(onSubmit)}
          calculateTotals={calculateTotals}
        />
      </div>
    </div>
  )
}