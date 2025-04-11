import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface FlowStep {
  id: string;
  title: string;
  description: string;
  order_index: number;
}

interface FlowOption {
  id: string;
  title: string;
  description: string;
}

export function FlowBuilder() {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [steps, setSteps] = useState<FlowStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [options, setOptions] = useState<FlowOption[]>([]);
  const [selections, setSelections] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchSteps() {
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', categorySlug)
        .single();

      if (categoryData) {
        const { data: stepsData } = await supabase
          .from('flow_steps')
          .select('*')
          .eq('category_id', categoryData.id)
          .order('order_index');

        if (stepsData) setSteps(stepsData);
      }
    }
    fetchSteps();
  }, [categorySlug]);

  useEffect(() => {
    async function fetchOptions() {
      if (steps[currentStepIndex]) {
        const { data } = await supabase
          .from('flow_options')
          .select('*')
          .eq('step_id', steps[currentStepIndex].id);

        if (data) setOptions(data);
      }
    }
    fetchOptions();
  }, [currentStepIndex, steps]);

  const handleOptionSelect = (optionId: string) => {
    setSelections((prev) => ({
      ...prev,
      [steps[currentStepIndex].id]: optionId,
    }));

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // Handle completion - fetch recommendations
      fetchRecommendations();
    }
  };

  const fetchRecommendations = async () => {
    // Implementation for fetching recommendations based on selections
    console.log('Fetching recommendations with selections:', selections);
  };

  const currentStep = steps[currentStepIndex];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {currentStep && (
        <>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">{currentStep.title}</h1>
            <p className="text-gray-600">{currentStep.description}</p>
          </div>

          <div className="space-y-4">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option.id)}
                className="w-full p-4 text-left bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200"
              >
                <h3 className="text-lg font-medium text-gray-900">{option.title}</h3>
                {option.description && (
                  <p className="mt-1 text-gray-500">{option.description}</p>
                )}
              </button>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentStepIndex === 0}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <div className="text-sm text-gray-500">
              Step {currentStepIndex + 1} of {steps.length}
            </div>
          </div>
        </>
      )}
    </div>
  );
}