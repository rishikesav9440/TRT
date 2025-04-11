import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeProps,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Plus, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface FlowStep {
  id: string;
  category_id: string;
  title: string;
  description: string;
  order_index: number;
  parent_option_id: string | null;
  is_conditional: boolean;
}

interface FlowOption {
  id: string;
  step_id: string;
  title: string;
  description: string;
}

const StepNode = ({ data }: NodeProps) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 min-w-[200px]">
      <Handle type="target" position={Position.Left} className="w-3 h-3" />
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">{data.title}</h3>
          <button className="text-gray-400 hover:text-gray-600">
            <Settings className="w-4 h-4" />
          </button>
        </div>
        {data.description && (
          <p className="text-sm text-gray-500">{data.description}</p>
        )}
        {data.options && (
          <div className="space-y-2 pt-2 border-t">
            {data.options.map((option: FlowOption) => (
              <div
                key={option.id}
                className="text-sm bg-gray-50 p-2 rounded flex items-center justify-between"
              >
                <span>{option.title}</span>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={option.id}
                  className="w-3 h-3"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const nodeTypes = {
  step: StepNode,
};

export function AdminPanel() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [newCategory, setNewCategory] = useState({ name: '', slug: '' });
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [options, setOptions] = useState<Record<string, FlowOption[]>>({});

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchSteps();
    }
  }, [selectedCategory]);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*');
    if (data) setCategories(data);
  }

  async function fetchSteps() {
    const { data: stepsData } = await supabase
      .from('flow_steps')
      .select('*')
      .eq('category_id', selectedCategory)
      .order('order_index');

    if (stepsData) {
      // Fetch options for each step
      const optionsPromises = stepsData.map((step) =>
        supabase
          .from('flow_options')
          .select('*')
          .eq('step_id', step.id)
      );

      const optionsResults = await Promise.all(optionsPromises);
      const optionsMap: Record<string, FlowOption[]> = {};
      optionsResults.forEach((result, index) => {
        if (result.data) {
          optionsMap[stepsData[index].id] = result.data;
        }
      });
      setOptions(optionsMap);

      // Create nodes from steps
      const flowNodes: Node[] = stepsData.map((step, index) => ({
        id: step.id,
        type: 'step',
        position: { x: index * 300, y: 0 },
        data: {
          ...step,
          options: optionsMap[step.id] || [],
        },
      }));

      setNodes(flowNodes);

      // Fetch and create edges from conditions
      const { data: conditionsData } = await supabase
        .from('flow_conditions')
        .select('*');

      if (conditionsData) {
        const flowEdges: Edge[] = conditionsData.map((condition) => ({
          id: condition.id,
          source: condition.option_id,
          target: condition.next_step_id,
          type: 'smoothstep',
          animated: true,
        }));
        setEdges(flowEdges);
      }
    }
  }

  async function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    const { data, error } = await supabase
      .from('categories')
      .insert([{ name: newCategory.name, slug: newCategory.slug }]);
    
    if (!error) {
      fetchCategories();
      setNewCategory({ name: '', slug: '' });
    }
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-none bg-white border-b p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Flow Builder</h1>
          <div className="flex items-center space-x-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              <option value="">Select a category...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => document.getElementById('addCategoryForm')?.classList.toggle('hidden')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </button>
          </div>
        </div>
      </div>

      <div id="addCategoryForm" className="hidden bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto p-4">
          <form onSubmit={handleAddCategory} className="flex items-center space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Slug</label>
              <input
                type="text"
                value={newCategory.slug}
                onChange={(e) => setNewCategory({ ...newCategory, slug: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <button
              type="submit"
              className="mt-6 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Add
            </button>
          </form>
        </div>
      </div>

      <div className="flex-1 bg-gray-100">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-gray-50"
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}