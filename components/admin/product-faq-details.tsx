import { Input } from "../ui";
import { Button } from "../ui";
import { useState } from "react";
import { Product, Faq } from "@/lib/types";
import { PlusIcon, XIcon } from "lucide-react";
import { Primitive, z } from "zod";
import RichTextEditor from "../rich-text-editor";
import { useToast } from "../ui";

const faqSchema = z.object({
  question: z.string().min(1, {
    message: "Question is required.",
  }),
  answer: z.string().min(1, {
    message: "Answer is required.",
  }),
});

function ProductFaqDetails({
  formData,
  setFormData,
  formErrors,
}: {
  formData: Product;
  setFormData: (formData: Product) => void;
  formErrors: any;
}) {
  const { toast } = useToast();

  const [newFAQ, setNewFAQ] = useState<Faq>({
    question: "",
    answer: "",
  });

  const addFAQ = () => {
    const validation = faqSchema.safeParse(newFAQ);

    if (!validation.success) {
      const errors = validation.error.errors;
      toast({
        title: "Validation Error",
        description:
          errors[0]?.message || "Please fill in all required FAQ fields",
        variant: "destructive",
      });
      return;
    }

    setFormData({
      ...formData,
      faqs: [...(formData.faqs || []), newFAQ],
    });

    setNewFAQ({
      question: "",
      answer: "",
    });
  };

  const removeFAQ = (index: number) => {
    const faqs = [...(formData.faqs || [])];
    faqs.splice(index, 1);
    setFormData({ ...formData, faqs });
  };
  return (
    <div className="space-y-6">
      <div className="space-y-6">
        <div className="bg-muted/50 p-4 rounded-md dark:bg-slate-800/40">
          <h3 className="font-medium mb-2 dark:text-white">
            Add Frequently Asked Questions
          </h3>
          <p className="text-sm text-muted-foreground mb-4 dark:text-slate-300">
            Add common questions and answers about your token. This helps users
            find information quickly.
          </p>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="question"
                className={`block text-sm font-medium mb-1.5 text-foreground dark:text-white`}
              >
                Question{" "}
                <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <Input
                id="question"
                placeholder="e.g., What is the token's use case?"
                value={newFAQ.question}
                onChange={(e) =>
                  setNewFAQ({ ...newFAQ, question: e.target.value })
                }
                className="h-12 dark:bg-slate-900 dark:border-slate-700 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="answer"
                className={`block text-sm font-medium mb-1.5 text-foreground dark:text-white`}
              >
                Answer <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <RichTextEditor
                value={newFAQ.answer || ""}
                onChange={(value) => setNewFAQ({ ...newFAQ, answer: value })}
                placeholder="Enter answer"
              />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={addFAQ}
              className="w-full dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add FAQ
            </Button>
          </div>
        </div>

        {formData.faqs && formData.faqs.length > 0 ? (
          <div className="space-y-4">
            <h3 className="font-medium dark:text-white">Added FAQs</h3>

            {formData.faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 rounded-md border dark:border-slate-700 p-4 relative shadow-sm"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFAQ(index)}
                  className="absolute right-2 top-2 text-muted-foreground hover:text-destructive dark:text-slate-400 dark:hover:text-red-400"
                >
                  <XIcon className="h-4 w-4" />
                </Button>

                <div className="pr-8">
                  <h4 className="font-medium dark:text-white">
                    {faq.question}
                  </h4>
                  <div
                    className="prose dark:prose-invert max-w-none mb-6 text-foreground dark:text-white/80 "
                    dangerouslySetInnerHTML={{ __html: faq.answer }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground border border-dashed rounded-md dark:border-slate-700 dark:text-slate-400">
            <PlusIcon className="mx-auto h-8 w-8 mb-2" />
            <p>No FAQs added yet</p>
            <p className="text-sm mt-1">
              Add common questions and answers about your token
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductFaqDetails;
