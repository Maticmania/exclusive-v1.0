import AccountSidebar from "@/components/profile/account-sidebar";
import OrdersContent from "@/components/orders/orders-content";

export const metadata = {
  title: "My Orders | E-commerce",
  description: "View your order history",
};

export default function OrdersPage() {

  return (
    <>
      <div className="container max-w-screen-xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6 md:hidden">My Account</h1>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/4">
            <AccountSidebar />
          </div>
          <div className="w-full md:w-3/4">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold mb-6">My Orders</h2>
              <OrdersContent />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
