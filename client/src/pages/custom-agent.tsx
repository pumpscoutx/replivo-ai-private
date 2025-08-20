import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCustomRequestSchema } from "@shared/schema";
import { TRENDING_TEMPLATES, BUDGET_RANGES, INDUSTRIES } from "@/lib/constants";
import type { InsertCustomRequest } from "@shared/schema";
import { z } from "zod";

const formSchema = insertCustomRequestSchema.extend({
  industry: z.string().optional(),
  budgetRange: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function CustomAgent() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      industry: "",
      budgetRange: "",
      allowPooling: false,
    },
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data: InsertCustomRequest) => {
      const response = await apiRequest("POST", "/api/custom-requests", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-requests"] });
      toast({
        title: "Request Submitted!",
        description: "We'll get back to you within 24 hours with a custom agent proposal.",
      });
      form.reset();
      setCurrentStep(1);
      setSelectedTemplate(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createRequestMutation.mutate(data);
  };

  const selectTemplate = (templateName: string, description: string) => {
    setSelectedTemplate(templateName);
    form.setValue("description", `${templateName}: ${description}`);
    setCurrentStep(2);
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      {/* Custom Agent Builder Section */}
      <section className="py-32 bg-black relative">
        <div className="absolute inset-0 opacity-15" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&h=1380')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}></div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-block bg-gray-800/50 text-gray-300 rounded-full px-6 py-2 mb-6 font-semibold text-sm border border-gray-600/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <i className="fas fa-magic mr-2"></i>
              CUSTOM AI SOLUTIONS
            </motion.div>
            <h2 className="text-5xl md:text-6xl font-nano font-black text-white mb-6 leading-tight">
              CREATE YOUR PERFECT
              <br />
              <span className="text-gradient">AI ASSISTANT</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Our expert team will design and build a custom AI agent tailored specifically to your unique business requirements. 
              From concept to deployment in just 48 hours.
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <motion.div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        step <= currentStep ? "bg-primary text-white" : "bg-gray-300 text-gray-600"
                      }`}
                      animate={step <= currentStep ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {step}
                    </motion.div>
                    {step < 3 && (
                      <div className={`w-16 h-1 rounded ml-4 ${
                        step < currentStep ? "bg-primary" : "bg-gray-300"
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Description or Template Selection */}
                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-dark">
                            What type of tasks do you need automated?
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              rows={4}
                              placeholder="Describe the specific tasks, workflows, or processes you'd like to automate..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Trending Templates */}
                    <div>
                      <label className="block text-sm font-semibold text-dark mb-4">
                        Or choose from trending templates:
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {TRENDING_TEMPLATES.map((template) => (
                          <motion.div
                            key={template.name}
                            className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                              selectedTemplate === template.name
                                ? "border-primary bg-blue-50"
                                : "border-gray-200 hover:border-primary"
                            }`}
                            onClick={() => selectTemplate(template.name, template.description)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="w-8 h-8 bg-blue-100 rounded-lg mb-3 flex items-center justify-center">
                              <i className={`${template.icon} text-blue-600`}></i>
                            </div>
                            <h4 className="font-semibold text-dark mb-1">{template.name}</h4>
                            <p className="text-xs text-secondary">{template.description}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Industry and Budget */}
                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="industry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-dark">Industry</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your industry" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {INDUSTRIES.map((industry) => (
                                  <SelectItem key={industry} value={industry.toLowerCase()}>
                                    {industry}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="budgetRange"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-dark">Budget Range</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select budget range" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {BUDGET_RANGES.map((range) => (
                                  <SelectItem key={range} value={range.toLowerCase()}>
                                    {range}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Pooling and Final Options */}
                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="allowPooling"
                      render={({ field }) => (
                        <FormItem>
                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <div className="flex items-start space-x-3">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div>
                                <FormLabel className="font-semibold text-dark">Join Request Pool</FormLabel>
                                <p className="text-sm text-secondary mt-1">
                                  Allow others with similar requests to join and share development costs. 
                                  This can reduce your cost by up to 70%.
                                </p>
                              </div>
                            </div>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="px-6 py-3"
                  >
                    {currentStep === 1 ? "Save Draft" : "Previous"}
                  </Button>
                  
                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={currentStep === 1 && !form.getValues("description")}
                      className="px-8 py-3 bg-primary hover:bg-primary-dark text-white"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={createRequestMutation.isPending}
                      className="px-8 py-3 bg-primary hover:bg-primary-dark text-white"
                    >
                      {createRequestMutation.isPending ? "Submitting..." : "Submit Request"}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
