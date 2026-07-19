import { FaCheckCircle, FaHome, FaShoppingBag } from "react-icons/fa";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 text-center">
      <div className="mb-4 text-emerald-500" style={{ fontSize: "4rem" }}>
        <FaCheckCircle />
      </div>
      <h2 className="mb-2 text-2xl font-semibold text-foreground">
        Thank you for your order!
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Your order <span className="font-mono font-semibold">#{orderId}</span>{" "}
        has been placed successfully. You&apos;ll receive a confirmation email
        with the details shortly.
      </p>

      <div className="mb-6 rounded-xl border border-border bg-card px-4 py-3 text-sm text-left shadow-sm">
        <h3 className="mb-2 text-sm font-semibold text-foreground">
          What&apos;s next?
        </h3>
        <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
          <li>We&apos;re preparing your items for shipment.</li>
          <li>You can track your order status in the Orders section.</li>
          <li>We&apos;ll notify you when your order is on the way.</li>
        </ul>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link to="/orders" className="inline-flex items-center gap-2">
            <FaShoppingBag className="h-4 w-4" />
            View My Orders
          </Link>
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2"
        >
          <FaHome className="h-4 w-4" />
          Back to Home
        </Button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
