"use client"

import { useState, useEffect } from "react"
import { usePaymentStore } from "@/store/payment-store"
import PaymentForm from "./payment-form"
import PaymentCard from "./payment-card"
import PasswordConfirmModal from "./password-confirm-modal"
import { Button } from "@/components/ui/button"
import { Plus, CreditCard } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function PaymentManager({ initialPaymentOptions = [] }) {
  const router = useRouter()
  const {
    paymentOptions,
    isLoading,
    error,
    fetchPaymentOptions,
    addPaymentOption,
    updatePaymentOption,
    deletePaymentOption,
    setDefaultPaymentOption,
  } = usePaymentStore()

  // Form visibility states
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPayment, setEditingPayment] = useState(null)

  // Password confirmation modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordModalPurpose, setPasswordModalPurpose] = useState(null)
  const [selectedPaymentId, setSelectedPaymentId] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [confirmedPassword, setConfirmedPassword] = useState(null)

  // Initialize store with server-fetched payment options
  useEffect(() => {
    if (initialPaymentOptions.length > 0) {
      usePaymentStore.setState({ paymentOptions: initialPaymentOptions })
    } else {
      fetchPaymentOptions()
    }
  }, [initialPaymentOptions, fetchPaymentOptions])

  // When password is confirmed for adding a new payment
  useEffect(() => {
    if (confirmedPassword && passwordModalPurpose === "add") {
      setShowAddForm(true)
      setPasswordModalPurpose(null)
    }
  }, [confirmedPassword, passwordModalPurpose])

  // Handle initiating add payment flow
  const initiateAddPayment = () => {
    setPasswordModalPurpose("add")
    setShowPasswordModal(true)
  }

  // Handle password confirmation
  const handlePasswordConfirm = async (password) => {
    setIsProcessing(true)
    try {
      // Store the confirmed password for later use
      setConfirmedPassword(password)

      // Handle different purposes
      if (passwordModalPurpose === "delete" && selectedPaymentId) {
        await handleDeletePayment(selectedPaymentId, password)
      } else if (passwordModalPurpose === "setDefault" && selectedPaymentId) {
        await handleSetDefaultPayment(selectedPaymentId, password)
      } else if (passwordModalPurpose === "edit" && selectedPaymentId) {
        const paymentToEdit = paymentOptions.find((p) => p._id === selectedPaymentId)
        if (paymentToEdit) {
          setEditingPayment({ ...paymentToEdit, confirmedPassword: password })
        }
      }

      // Close the modal
      setShowPasswordModal(false)
    } catch (error) {
      throw new Error(error.message || "Password confirmation failed")
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle adding a new payment
  const handleAddPayment = async (paymentData) => {
    try {
      const result = await addPaymentOption(paymentData, confirmedPassword)
      if (result.success) {
        setShowAddForm(false)
        setConfirmedPassword(null)
        // Force a refresh to update the UI
        router.refresh()
        return { success: true }
      }
      return result
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Handle updating a payment
  const handleUpdatePayment = async (paymentData) => {
    try {
      // Use the password that was confirmed in the modal
      const password = editingPayment.confirmedPassword
      const result = await updatePaymentOption(editingPayment._id, paymentData, password)
      if (result.success) {
        setEditingPayment(null)
        // Force a refresh to update the UI
        router.refresh()
        return { success: true }
      }
      return result
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Initiate edit payment flow
  const initiateEditPayment = (payment) => {
    setSelectedPaymentId(payment._id)
    setPasswordModalPurpose("edit")
    setShowPasswordModal(true)
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingPayment(null)
  }

  // Handle cancel add
  const handleCancelAdd = () => {
    setShowAddForm(false)
    setConfirmedPassword(null)
  }

  // Initiate delete payment flow
  const initiateDeletePayment = (id) => {
    setSelectedPaymentId(id)
    setPasswordModalPurpose("delete")
    setShowPasswordModal(true)
  }

  // Handle delete payment
  const handleDeletePayment = async (id, password) => {
    try {
      const result = await deletePaymentOption(id, password)
      if (result.success) {
        toast.success("Payment method deleted", {
          description: "Your payment method has been removed successfully.",
        })
        // Force a refresh to update the UI
        router.refresh()
      }
      return result
    } catch (error) {
      toast.error("Failed to delete payment method", {
        description: error.message || "Please try again.",
      })
      return { success: false, error: error.message }
    }
  }

  // Initiate set default payment flow
  const initiateSetDefaultPayment = (id) => {
    setSelectedPaymentId(id)
    setPasswordModalPurpose("setDefault")
    setShowPasswordModal(true)
  }

  // Handle set default payment
  const handleSetDefaultPayment = async (id, password) => {
    try {
      const result = await setDefaultPaymentOption(id, password)
      if (result.success) {
        toast.success("Default payment method updated", {
          description: "Your default payment method has been updated successfully.",
        })
        // Force a refresh to update the UI
        router.refresh()
      }
      return result
    } catch (error) {
      toast.error("Failed to update default payment method", {
        description: error.message || "Please try again.",
      })
      return { success: false, error: error.message }
    }
  }

  // Get modal title and description based on purpose
  const getModalConfig = () => {
    switch (passwordModalPurpose) {
      case "add":
        return {
          title: "Confirm Password",
          description: "Please enter your password to add a new payment method.",
          confirmButtonText: "Continue",
        }
      case "edit":
        return {
          title: "Confirm Password",
          description: "Please enter your password to edit this payment method.",
          confirmButtonText: "Continue",
        }
      case "delete":
        return {
          title: "Confirm Deletion",
          description: "Please enter your password to delete this payment method.",
          confirmButtonText: "Delete",
        }
      case "setDefault":
        return {
          title: "Confirm Default Payment",
          description: "Please enter your password to set this as your default payment method.",
          confirmButtonText: "Set as Default",
        }
      default:
        return {
          title: "Confirm Password",
          description: "Please enter your password to continue.",
          confirmButtonText: "Continue",
        }
    }
  }

  const modalConfig = getModalConfig()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Payment Methods</h2>
        {!showAddForm && !editingPayment && (
          <Button onClick={initiateAddPayment} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            <span>Add New Payment Method</span>
          </Button>
        )}
      </div>

      {error && <div className="bg-red-50 text-red-500 p-4 rounded-md mb-4">{error}</div>}

      {/* Password confirmation modal */}
      <PasswordConfirmModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false)
          setPasswordModalPurpose(null)
          setSelectedPaymentId(null)
        }}
        onConfirm={handlePasswordConfirm}
        title={modalConfig.title}
        description={modalConfig.description}
        confirmButtonText={modalConfig.confirmButtonText}
        isProcessing={isProcessing}
      />

      {showAddForm && (
        <div className="border rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium mb-4">Add New Payment Method</h3>
          <PaymentForm isNew={true} onSave={handleAddPayment} onCancel={handleCancelAdd} passwordConfirmed={true} />
        </div>
      )}

      {editingPayment && (
        <div className="border rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium mb-4">Edit Payment Method</h3>
          <PaymentForm
            paymentOption={editingPayment}
            onSave={handleUpdatePayment}
            onCancel={handleCancelEdit}
            passwordConfirmed={true}
          />
        </div>
      )}

      {isLoading && paymentOptions.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading payment methods...</p>
        </div>
      ) : paymentOptions.length === 0 ? (
        <div className="text-center py-10 border rounded-lg">
          <div className="flex justify-center mb-4">
            <CreditCard className="h-12 w-12 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-4">You haven't added any payment methods yet.</p>
          {!showAddForm && <Button onClick={initiateAddPayment}>Add Your First Payment Method</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentOptions.map((payment) => (
            <PaymentCard
              key={payment._id}
              paymentOption={payment}
              onEdit={initiateEditPayment}
              onDelete={initiateDeletePayment}
              onSetDefault={initiateSetDefaultPayment}
            />
          ))}
        </div>
      )}
    </div>
  )
}

