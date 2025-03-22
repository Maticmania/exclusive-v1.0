"use client";

import { useState, useEffect } from "react";
import { useAddressStore } from "@/store/address-store";
import AddressForm from "./address-form";
import AddressCard from "./address-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AddressManager({ initialAddresses = [] }) {
  const {
    addresses,
    isLoading,
    error,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAddressStore();
  const router = useRouter();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Initialize store with server-fetched addresses
  useEffect(() => {
    if (initialAddresses.length > 0) {
      useAddressStore.setState({ addresses: initialAddresses });
    } else {
      fetchAddresses();
    }
  }, [initialAddresses, fetchAddresses]);

  const handleAddAddress = async (data) => {
    await addAddress(data);
    setShowAddForm(false);
    router.refresh();
  };

  const handleUpdateAddress = async (data) => {
    await updateAddress(editingAddress._id, data);
    setEditingAddress(null);
    router.refresh();
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setShowAddForm(false);
  };

  const handleCancelEdit = () => {
    setEditingAddress(null);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      toast.success("Default address updated", {
        description: "Your default address has been updated successfully.",
      });
      router.refresh();
    } catch (error) {
      toast.error("Failed to update default address", {
        description: "Please try again.",
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Address Book</h2>
        {!showAddForm && !editingAddress && (
          <Button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Address</span>
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md mb-4">
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="border rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium mb-4">Add New Address</h3>
          <AddressForm
            isNew={true}
            onSave={handleAddAddress}
            onCancel={handleCancelAdd}
          />
        </div>
      )}

      {editingAddress && (
        <div className="border rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium mb-4">Edit Address</h3>
          <AddressForm
            address={editingAddress}
            onSave={handleUpdateAddress}
            onCancel={handleCancelEdit}
          />
        </div>
      )}

      {isLoading && addresses.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading addresses...</p>
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-10 border rounded-lg">
          <p className="text-muted-foreground mb-4">
            You haven't added any addresses yet.
          </p>
          {!showAddForm && (
            <Button onClick={() => setShowAddForm(true)}>
              Add Your First Address
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <AddressCard
              key={address._id}
              address={address}
              onEdit={handleEditAddress}
              onDelete={deleteAddress}
              onSetDefault={handleSetDefault}
            />
          ))}
        </div>
      )}
    </div>
  );
}
