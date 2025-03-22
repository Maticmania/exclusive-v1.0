"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Country, State } from "country-state-city"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { X, Check } from "lucide-react"

export default function AddressForm({ address = null, onSave, onCancel, isNew = false }) {
  const [countries, setCountries] = useState([])
  const [states, setStates] = useState([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      street: address?.street || "",
      city: address?.city || "",
      state: address?.state || "",
      zipCode: address?.zipCode || "",
      country: address?.country || "",
      isDefault: address?.isDefault || false,
    },
  })

  const selectedCountry = watch("country")

  // Load countries on component mount
  useEffect(() => {
    const allCountries = Country.getAllCountries()
    setCountries(allCountries)
  }, [])

  // Update states when country changes
  useEffect(() => {
    if (selectedCountry) {
      const countryStates = State.getStatesOfCountry(selectedCountry)
      setStates(countryStates)
    } else {
      setStates([])
    }
  }, [selectedCountry])

  const onSubmit = async (data) => {
    try {
      await onSave(data)
      toast.success(isNew ? "Address added" : "Address updated", {
        description: isNew
          ? "Your address has been added successfully."
          : "Your address has been updated successfully.",
      })
      
    } catch (error) {
      console.error("Error saving address:", error)
      toast.error("Failed to save address", {
        description: "Please try again.",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="street">Street Address</Label>
        <Input
          id="street"
          {...register("street", { required: "Street address is required" })}
          placeholder="123 Main St, Apt 4B"
        />
        {errors.street && <p className="text-sm text-red-500">{errors.street.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        <Input id="city" {...register("city", { required: "City is required" })} placeholder="New York" />
        {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select onValueChange={(value) => setValue("country", value)} defaultValue={address?.country || ""}>
            <SelectTrigger id="country">
              <SelectValue placeholder="Select a country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.isoCode} value={country.isoCode}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.country && <p className="text-sm text-red-500">{errors.country.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State/Province</Label>
          <Select
            onValueChange={(value) => setValue("state", value)}
            defaultValue={address?.state || ""}
            disabled={!selectedCountry || states.length === 0}
          >
            <SelectTrigger id="state">
              <SelectValue placeholder="Select a state" />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state.isoCode} value={state.isoCode}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="zipCode">Zip/Postal Code</Label>
        <Input id="zipCode" {...register("zipCode", { required: "Zip code is required" })} placeholder="10001" />
        {errors.zipCode && <p className="text-sm text-red-500">{errors.zipCode.message}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isDefault"
          checked={watch("isDefault")}
          onCheckedChange={(checked) => setValue("isDefault", checked)}
        />
        <Label htmlFor="isDefault" className="text-sm font-normal cursor-pointer">
          Set as default address
        </Label>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} className="flex items-center gap-1">
          <X className="h-4 w-4" />
          <span>Cancel</span>
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex items-center gap-1">
          <Check className="h-4 w-4" />
          <span>{isSubmitting ? "Saving..." : "Save Address"}</span>
        </Button>
      </div>
    </form>
  )
}

