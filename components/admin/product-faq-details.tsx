"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";
import { z } from "zod";
import RichTextEditor from "../rich-text-editor";
import { useToast } from "@/components/ui/use-toast";
import { Product, Faq } from "@/lib/types";
import { cn } from "@/lib/utils";

const faqSchema = z.object({
  question: z.string().min(1, {
    message: "Question is required.",
  }),
  answer: z.string().min(1, {
    message: "Answer is required.",
  }),
});

interface ProductFaqDetailsProps {
  formData: Product;
  setFormData: (formData: Product) => void;
  formErrors?: Record<string, string>;
}

function ProductFaqDetails({ formData, setFormData, formErrors }: ProductFaqDetailsProps) {
  const { toast } = useToast();

  const [newFAQ, setNewFAQ] = useState<Faq>({
    question: "",
    answer: "",
  });

  const [faqErrors, setFaqErrors] = useState<{ question?: string; answer?: string }>({});

  const addFAQ = () => {
    const validation = faqSchema.safeParse(newFAQ);

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      setFaqErrors({
        question: errors.question?.[0],
        answer: errors.answer?.[0],
      });
      toast({
        title: "Validation Error",
        description: errors.question?.[0] || errors.answer?.[0] || "Please fill in all required FAQ fields",
        variant: "destructive",
      });
      return;
    }

    setFormData({
      ...formData,
      faqs: [...(formData.faqs || []), newFAQ],
    });

    setNewFAQ({ question: "", answer: "" });
    setFaqErrors({});

    toast({
      title: "Success",
      description: "FAQ added successfully",
    });
  };

  const removeFAQ = (index: number) => {
    const faqs = [...(formData.faqs || [])];
    faqs.splice(index, 1);
    setFormData({ ...formData, faqs });
    toast({
      title: "Success",
      description: "FAQ removed successfully",
    });
  };

  const handleFaqKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addFAQ();
    }
  };

  return (
    <div className="space-y-6">
      {/* Add FAQ Section */}
      <div className="border-t-2 border-gray-100 pt-6">
        <label className="block text-sm font-semibold text-gray-900 mb-2 dark:text-white">
          Add Frequently Asked Questions
        </label>
        <p className="text-xs text-gray-600 mb-3 dark:text-gray-400">
          Add common questions and answers about your product to help users find information quickly.
        </p>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="faq-question"
              className="block text-sm font-semibold text-gray-900 mb-2 dark:text-white"
            >
              Question <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <Input
              id="faq-question"
              placeholder="e.g., What is this product used for?"
              value={newFAQ.question}
              onChange={(e) => {
                setNewFAQ({ ...newFAQ, question: e.target.value });
                setFaqErrors({ ...faqErrors, question: undefined });
              }}
              onKeyDown={handleFaqKeyDown}
              className={cn(
                "h-12 border-2 border-gray-200 rounded-lg focus-visible:ring-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white",
                faqErrors.question && "border-red-600 focus-visible:ring-red-600"
              )}
              aria-describedby={faqErrors.question ? "faq-question-error" : undefined}
            />
            {faqErrors.question && (
              <p id="faq-question-error" className="text-sm text-red-600 mt-1 dark:text-red-400">
                {faqErrors.question}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="faq-answer"
              className="block text-sm font-semibold text-gray-900 mb-2 dark:text-white"
            >
              Answer <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <RichTextEditor
              value={newFAQ.answer || ""}
              onChange={(value) => {
                setNewFAQ({ ...newFAQ, answer: value });
                setFaqErrors({ ...faqErrors, answer: undefined });
              }}
              placeholder="Enter answer"
              minWords={5}
              maxWords={200}
              className="min-h-[150px] border-2 border-gray-200 rounded-lg focus-visible:ring-gray-900 dark:bg-gray-800 dark:border-gray-700"
              aria-describedby={faqErrors.answer ? "faq-answer-error" : undefined}
            />
            {faqErrors.answer && (
              <p id="faq-answer-error" className="text-sm text-red-600 mt-1 dark:text-red-400">
                {faqErrors.answer}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={addFAQ}
              className="w-full h-12 px-6 bg-gray-900 hover:bg-black rounded-lg text-white dark:bg-gray-700 dark:hover:bg-gray-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add FAQ
            </Button>
          </div>
        </div>
      </div>

      {/* Added FAQs Section */}
      {formData.faqs && formData.faqs.length > 0 ? (
        <div className="border-t-2 border-gray-100 pt-6">
          <label className="block text-sm font-semibold text-gray-900 mb-2 dark:text-white">
            Added FAQs
          </label>
          <div className="space-y-3">
            {formData.faqs.map((faq, index) => (
              <div
                key={index}
                className="border-2 border-gray-200 bg-white rounded-lg p-4 relative shadow-sm dark:bg-gray-800 dark:border-gray-700"
              >
                <button
                  type="button"
                  onClick={() => removeFAQ(index)}
                  className="absolute right-2 top-2 p-1 hover:bg-red-50 rounded-full transition-colors dark:hover:bg-red-900/50"
                  aria-label={`Remove FAQ: ${faq.question}`}
                >
                  <X className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />
                </button>
                <div className="pr-8">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    {faq.question}
                  </h4>
                  <div
                    className="text-sm text-gray-900 dark:text-gray-200 mt-2"
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center dark:border-gray-700">
          <Plus className="h-12 w-12 text-gray-400 mx-auto mb-3 dark:text-gray-500" />
          <p className="text-sm text-gray-600 mb-1 dark:text-gray-400">No FAQs added yet</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Add common questions and answers about your product
          </p>
        </div>
      )}
    </div>
  );
}

export default ProductFaqDetails;