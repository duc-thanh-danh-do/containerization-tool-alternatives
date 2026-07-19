import React, { useState } from "react";
import SellerLayout from "./SellerLayout";
import KYCForm from "./KYCForm";
import SellerHub from "./SellerHub";

const SellerDashboard = () => {
  // Initialize state directly from localStorage - no effect needed
  const [isVerified, setIsVerified] = useState(() => {
    return localStorage.getItem("isSellerVerified") === "true";
  });

  const handleKYCComplete = () => {
    localStorage.setItem("isSellerVerified", "true");
    setIsVerified(true);
  };

  if (!isVerified) {
    return <KYCForm onComplete={handleKYCComplete} />;
  }

  return (
    <SellerLayout>
      <SellerHub />
    </SellerLayout>
  );
};

export default SellerDashboard;
