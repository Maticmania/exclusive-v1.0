"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Country, State } from "country-state-city"
import { toast } from "sonner"

export default function AddressCard({ address, onEdit, onDelete, onSetDefault }) {
  const [isDeleting, setIsDeleting] = useState(false)

  // Get country and state names from codes
  const country = Country.getCountryByCode(address.country)
  const state = State.getStateByCodeAndCountry(address.state, address.country)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await onDelete(address._id)
      toast.success("Address deleted", {
        description: "Your address has been removed successfully.",
      })
    } catch (error) {
      console.error("Error deleting address:", error)
      toast.error("Failed to delete address", {
        description: "Please try again.",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="border rounded-lg p-4 relative">
      {address.isDefault && (
        <Badge className="absolute top-2 right-2" variant="secondary">
          Default
        </Badge>
      )}

      <div className="space-y-2 mb-4">
        <p className="font-medium">{address.street}</p>
        <p>
          {address.city}, {state?.name || address.state} {address.zipCode}
        </p>
        <p>{country?.name || address.country}</p>
      </div>

      <div className="flex space-x-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(address)} className="flex items-center gap-1">
          <Pencil className="h-3.5 w-3.5" />
          <span>Edit</span>
        </Button>

        {!address.isDefault && (
          <Button variant="outline" size="sm" onClick={() => onSetDefault(address._id)}>
            Set as Default
          </Button>
        )}

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 flex items-center gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Address</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this address? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600" disabled={isDeleting}>
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

