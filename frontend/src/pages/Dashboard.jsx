import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Hero from "../components/Hero";
import InputForm from "../components/InputForm";
import Result from "./Result";

export default function Dashboard() {
  const [step, setStep] = useState("hero");
  const [formData, setFormData] = useState(null);

  return (
    <div className="min-h-screen bg-white font-[Times New Roman] overflow-hidden">
      <AnimatePresence mode="wait">
        {step === "hero" && (
          <motion.div
            key="hero"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
          >
            <Hero onStart={() => setStep("input")} />
          </motion.div>
        )}

        {step === "input" && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
          >
            <InputForm
              onSubmit={(data) => {
                setFormData(data);
                setStep("result");
              }}
            />
          </motion.div>
        )}

        {step === "result" && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Result data={formData} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
