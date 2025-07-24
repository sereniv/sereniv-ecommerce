"use client";

import {useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Entity,
} from "@/lib/types/entity";
import BasicDetails from "@/components/basic-details";
import StatsDetails from "@/components/stats-details";
import AboutDetails from "@/components/about-details";
import { getApiUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { DocumentIcon } from "@/components/icons";
import SocialDetails from "./social-details";
import BalanceSheetDetails from "./balance-sheet-details";
  import SeoDetails from "./seo-details";

import { useToast } from "@/components/ui/use-toast";

export default function AddEntityForm() {


  const router = useRouter();
  const { toast } = useToast()

  const [formData, setFormData] = useState<Entity>({
    id: "",
    entityId: "",
    slug: "",
    name: "",
    ticker: "",
    countryName: "",
    countryFlag: "",
    type: "",
    marketCap: 0,
    enterpriseValue: 0,
    bitcoinHoldings: 0,
    btcPerShare: 0,
    costBasis: 0,
    usdValue: 0,
    ngu: 0,
    mNav: 0,
    sharePrice: 0,
    marketCapPercentage: 0,
    supplyPercentage: 0,
    profitLossPercentage: 0,
    holdingSince: "",
    externalWebsiteSlug: "",
    avgCostPerBTC: 0,  
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    bitcoinValueInUSD: 0,
    rank: "",
    entityAbout: [],
    entityLinks: [],
    balanceSheet: [],
    entityTimeSeries: [],
    entityHistorical: null,
    seoTitle:"",
    seoDescription:"",
    seoKeywords:[],
    seoImage:""
  });


  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [formIsSubmitting, setFormIsSubmitting] = useState(false);
  const [stepValidated, setStepValidated] = useState<{ [key: number]: boolean }>({
    0: false,
    1: false,
    2: false,
    3: false,
    4: false,
  });

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: "basics",
      title: "Basic Details",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
      description: "Basic entity information",
      color: "from-orange-500 to-orange-600"
    },
    // {
    //   id: "statistics",
    //   title: "Statistics",
    //   icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    //   description: "Financial statistics",
    //   color: "from-amber-500 to-amber-600"
    // },
    {
      id: "aboutEntity",
      title: "About",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      description: "Detailed information",
      color: "from-orange-600 to-red-500"
    },
    {
      id: "socialLinks",
      title: "Social Links",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>,
      description: "Social media links",
      color: "from-amber-600 to-yellow-500"
    },
    {
      id: "balanceSheet",
      title: "Balance Sheet",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" /></svg>,
      description: "Financial statements",
      color: "from-red-500 to-orange-500"
    },
    {
      id: "seoDetails",
      title: "SEO Details",
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
      description: "Search engine optimization",
      color: "from-purple-500 to-pink-500"
    },
    ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormIsSubmitting(true);

    try {
      const response = await fetch(getApiUrl(`/admin/add-entity`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update Entity");
      }

      toast({
        title: "Entity Updated",
        description: "Entity has been successfully updated.",
      });

      router.push("/admin/entities");

    } catch (error) {
      console.error("Error updating Entity:", error instanceof Error ? error.message : "Failed to update Entity. Please try again.");
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update Entity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setFormIsSubmitting(false);
    }
  };

  const validateBasicDetails = () => {
    if (!formData?.name || !formData?.ticker || !formData?.type || !formData?.externalWebsiteSlug || !formData?.holdingSince || !formData?.countryFlag) {
      setFormErrors({
        name: !formData.name ? "Name is required" : "",
        ticker: !formData.ticker ? "Ticker is required" : "",
        type: !formData.type ? "Type is required" : "",
        externalWebsiteSlug: !formData.externalWebsiteSlug ? "External Website Slug is required" : "",
        holdingSince: !formData.holdingSince ? "Holding Since is required" : ""
      });
      return false;
    }
    setFormErrors({});
    setStepValidated({ ...stepValidated, 0: true });
    return true;
  };

  // const validateStatsDetails = () => {
  //   if (!formData.marketCap || !formData.sharePrice || !formData.enterpriseValue || !formData.bitcoinHoldings || !formData.btcPerShare || !formData.costBasis || !formData.usdValue || !formData.ngu || !formData.mNav || !formData.marketCapPercentage || !formData.supplyPercentage || !formData.profitLossPercentage || !formData.avgCostPerBTC || !formData.bitcoinValueInUSD) {
  //     setFormErrors({
  //       marketCap: !formData.marketCap ? "Market Cap is required" : "",
  //       sharePrice: !formData.sharePrice ? "Share Price is required" : "",
  //       enterpriseValue: !formData.enterpriseValue ? "Enterprise Value is required" : "",
  //       bitcoinHoldings: !formData.bitcoinHoldings ? "Bitcoin Holdings is required" : "",
  //       btcPerShare: !formData.btcPerShare ? "BTC Per Share is required" : "",
  //       costBasis: !formData.costBasis ? "Cost Basis is required" : "",
  //       usdValue: !formData.usdValue ? "USD Value is required" : "",
  //       ngu: !formData.ngu ? "Ngu is required" : "",
  //       mNav: !formData.mNav ? "M-NAV is required" : "",
  //       marketCapPercentage: !formData.marketCapPercentage ? "Market Cap Percentage is required" : "",
  //       supplyPercentage: !formData.supplyPercentage ? "Supply Percentage is required" : "",
  //       profitLossPercentage: !formData.profitLossPercentage ? "Profit Loss Percentage is required" : "",
  //       avgCostPerBTC: !formData.avgCostPerBTC ? "Avg Cost Per BTC is required" : "",
  //       bitcoinValueInUSD: !formData.bitcoinValueInUSD ? "Bitcoin Value in USD is required" : ""
  //       });
  //     return false;
  //   }
  //   setFormErrors({});
  //   setStepValidated({ ...stepValidated, 1: true });
  //   return true;
  // };

  const validateAboutDetails = () => {
    if (!formData?.entityAbout) {
      setFormErrors({
        entityAbout: "About is required"
      });
      return false;
    }
    setFormErrors({});
    setStepValidated({ ...stepValidated, 1: true });
    return true;
  }

  const validateSocialDetails = () => {
    if (!formData.entityLinks) {
      setFormErrors({
        entityLinks: "Social is required"
      });
      return false;
    }
    setFormErrors({});
    setStepValidated({ ...stepValidated, 2: true });
    return true;
  } 


  const validateBalanceSheetDetails = () => {
    if (!formData.balanceSheet) {
      setFormErrors({
        balanceSheet: "Balance Sheet is required"
      });
      return false;
    }
    setFormErrors({});
    setStepValidated({ ...stepValidated, 3: true });
    return true;
  }

  const validateSeoDetails = () => {
    if (!formData.seoTitle || !formData.seoDescription) {
      setFormErrors({
        seoTitle: !formData.seoTitle ? "SEO Title is required" : "",
        seoDescription: !formData.seoDescription ? "SEO Description is required" : ""
      });
      return false;
    }
    setFormErrors({});
    setStepValidated({ ...stepValidated, 4: true });
    return true;
  } 




  const nextStep = () => {
    let isValid = false;

    if (currentStep === 0) {
      isValid = validateBasicDetails();
    }
    //  else if (currentStep === 1) {
    //   isValid = validateStatsDetails();
    // } 
    else if (currentStep === 1) {
      isValid = validateAboutDetails();
    } else if (currentStep === 2) {
      isValid = validateSocialDetails();
    } else if (currentStep === 3) {
      isValid = validateBalanceSheetDetails();
    } else if (currentStep === 4) {
      isValid = validateSeoDetails();
    }

    if (isValid && currentStep < steps.length - 1) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        window.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }, 100);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }, 100);
  };

  return (
    <>
      <div className="lg:col-span-3">
        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm transition-all duration-700 hover:shadow-2xl hover:shadow-orange-500/20 dark:hover:shadow-orange-400/10 sticky top-6">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
          <div className="absolute top-0 right-0 w-16 h-16 sm:w-32 sm:h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full -translate-y-8 translate-x-8 sm:-translate-y-16 sm:translate-x-16 transition-transform duration-700 group-hover:scale-150" />
          
          <CardHeader className="relative bg-gradient-to-r from-orange-50/90 to-orange-100/70 dark:from-orange-950/90 dark:to-orange-900/70 backdrop-blur-sm border-b border-orange-200/50 dark:border-orange-800/50">
            <CardTitle className="text-lg text-orange-800 dark:text-orange-200 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="relative p-0">
            <nav className="flex flex-col">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  className={cn(
                    "flex items-center gap-3 px-6 py-4 hover:bg-orange-50 dark:hover:bg-orange-950/50 transition-colors text-left border-l-4 relative",
                    currentStep === index
                      ? "border-l-orange-500 font-medium bg-orange-50 dark:bg-orange-950/50 text-orange-800 dark:text-orange-200"
                      : "border-l-transparent text-gray-600 dark:text-gray-400 hover:border-l-orange-200 dark:hover:border-l-orange-800"
                  )}
                  onClick={() => setCurrentStep(index)}
                >
                  <div
                    className={cn(
                      "w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200",
                      currentStep === index 
                        ? `bg-gradient-to-r ${step.color} text-white shadow-lg` 
                        : "bg-gray-100 dark:bg-gray-800 text-gray-400 hover:bg-orange-100 dark:hover:bg-orange-900/50 hover:text-orange-600 dark:hover:text-orange-400"
                    )}
                  >
                    {stepValidated[index] ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div>
                    <div className="font-medium">{step.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {step.description}
                    </div>
                  </div>
                  {currentStep === index && (
                    <div className="absolute right-4 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                  )}
                </button>
              ))}
            </nav>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-9">
        <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm transition-all duration-700 hover:shadow-2xl hover:shadow-orange-500/20 dark:hover:shadow-orange-400/10">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
          <div className="absolute top-0 right-0 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -translate-y-24 translate-x-24 sm:-translate-y-48 sm:translate-x-48 transition-transform duration-1000 group-hover:scale-110" />
          
          <CardHeader className="relative border-b border-orange-200/50 dark:border-orange-800/50 bg-gradient-to-r from-orange-50/90 to-orange-100/70 dark:from-orange-950/90 dark:to-orange-900/70 backdrop-blur-sm">
            <CardTitle className="text-xl sm:text-2xl font-semibold text-orange-800 dark:text-orange-200 flex items-center gap-3">
              <div className={cn("w-8 h-8 rounded-lg bg-gradient-to-r flex items-center justify-center text-white", steps[currentStep].color)}>
                {steps[currentStep].icon}
              </div>
              {steps[currentStep].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative p-6 bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm">
            <form onSubmit={handleSubmit}>

              {currentStep === 0 && (
                <BasicDetails formData={formData} setFormData={setFormData} formErrors={formErrors} />
              )}
              {/* {currentStep === 1 && (
                <StatsDetails formData={formData} setFormData={setFormData} formErrors={formErrors} />
              )} */}
              {currentStep === 1 && (
                <AboutDetails formData={formData} setFormData={setFormData} formErrors={formErrors} />
              )}
              {currentStep === 2 && (
                <SocialDetails formData={formData} setFormData={setFormData} formErrors={formErrors} />
              )}
              {currentStep === 3 && (
                <BalanceSheetDetails formData={formData} setFormData={setFormData} formErrors={formErrors} />
              )}
              {currentStep === 4 && (
                <SeoDetails formData={formData} setFormData={setFormData} formErrors={formErrors} />
              )}
              <div className="flex justify-between mt-8 pt-6 border-t border-orange-100/50 dark:border-orange-900/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-950/50 hover:text-orange-700 dark:hover:text-orange-300 hover:border-orange-300 dark:hover:border-orange-700 disabled:opacity-50 backdrop-blur-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </Button>
                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Continue
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    disabled={formIsSubmitting}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {formIsSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Update Entity
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
