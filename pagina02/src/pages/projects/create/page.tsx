
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { supabase } from '../../../config/supabase';

const categories = [
  'Artes Visuais',
  'Teatro',
  'Música',
  'Audiovisual',
  'Dança',
  'Literatura',
  'Educação Cultural',
  'Patrimônio Cultural',
  'Eventos Culturais',
  'Outro'
];

const riskLevels = [
  { value: 'low', label: 'Baixo Risco', color: 'text-green-600' },
  { value: 'medium', label: 'Médio Risco', color: 'text-yellow-600' },
  { value: 'high', label: 'Alto Risco', color: 'text-red-600' }
];

const projectSizes = [
  { value: 'pequeno', label: 'Pequeno Porte (até R$ 100k)' },
  { value: 'medio', label: 'Médio Porte (R$ 100k - R$ 500k)' },
  { value: 'grande', label: 'Grande Porte (acima de R$ 500k)' }
];

export default function CreateProject() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    location: '',
    duration_months: '',
    project_size: 'medio',
    risk_level: 'medium',
    tags: '',
    image_url: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Você precisa estar logado para criar um projeto.');
      return;
    }

    // Validações
    if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
      setError('Título, descrição e categoria são obrigatórios.');
      return;
    }

    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      setError('Orçamento deve ser um valor positivo.');
      return;
    }

    if (!formData.location.trim()) {
      setError('Localização é obrigatória.');
      return;
    }

    if (!formData.duration_months || parseInt(formData.duration_months) <= 0) {
      setError('Duração deve ser um número positivo de meses.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const projectData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        budget: parseFloat(formData.budget),
        location: formData.location.trim(),
        duration_months: parseInt(formData.duration_months),
        project_size: formData.project_size,
        risk_level: formData.risk_level,
        tags: tagsArray,
        image_url: formData.image_url.trim() || null,
        creator_id: user.id,
        status: 'active'
      };

      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

      if (error) throw error;

      setSuccess('Projeto criado com sucesso!');
      setTimeout(() => {
        navigate(`/projects/${data.id}`);
      }, 1500);

    } catch (error: any) {
      console.error('Erro ao criar projeto:', error);
      setError(error.message || 'Erro ao criar projeto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-lock-line text-4xl text-red-600 mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600 mb-6">Você precisa estar logado para criar projetos.</p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <a href="/" className="text-2xl font-bold text-blue-600 cursor-pointer" style={{ fontFamily: "Pacifico, serif" }}>
                Porto de Ideias
              </a>
              <div className="h-6 w-px bg-gray-300"></div>
              <span className="text-gray-600">Criar Projeto</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
              >
                <i className="ri-dashboard-line mr-2"></i>
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Criar Novo Projeto</h1>
            <p className="text-gray-600">
              Compartilhe seu projeto cultural e conecte-se com investidores interessados
            </p>
          </div>

          {/* Messages */}
          {success && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              <div className="flex items-center">
                <i className="ri-check-circle-line text-xl mr-2"></i>
                {success}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <div className="flex items-center">
                <i className="ri-error-warning-line text-xl mr-2"></i>
                {error}
              </div>
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm border p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Informações Básicas */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">
                  Informações Básicas
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título do Projeto *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Festival de Jazz Contemporâneo São Paulo"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
                      required
                      disabled={loading}
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Localização *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: São Paulo, SP"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição do Projeto *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={4}
                      placeholder="Descreva detalhadamente seu projeto cultural, seus objetivos e impacto esperado..."
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              {/* Orçamento e Cronograma */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">
                  Orçamento e Cronograma
                </h2>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Orçamento Total (R$) *
                    </label>
                    <input
                      type="number"
                      value={formData.budget}
                      onChange={(e) => handleInputChange('budget', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="150000"
                      min="1"
                      step="1000"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duração (meses) *
                    </label>
                    <input
                      type="number"
                      value={formData.duration_months}
                      onChange={(e) => handleInputChange('duration_months', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="6"
                      min="1"
                      max="60"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Porte do Projeto
                    </label>
                    <select
                      value={formData.project_size}
                      onChange={(e) => handleInputChange('project_size', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
                      disabled={loading}
                    >
                      {projectSizes.map((size) => (
                        <option key={size.value} value={size.value}>{size.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Classificação e Tags */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">
                  Classificação e Palavras-chave
                </h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nível de Risco
                    </label>
                    <div className="space-y-3">
                      {riskLevels.map((risk) => (
                        <label key={risk.value} className="flex items-center">
                          <input
                            type="radio"
                            name="risk_level"
                            value={risk.value}
                            checked={formData.risk_level === risk.value}
                            onChange={(e) => handleInputChange('risk_level', e.target.value)}
                            className="mr-3 text-blue-600 focus:ring-blue-500"
                            disabled={loading}
                          />
                          <span className={`font-medium ${risk.color}`}>
                            {risk.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (separadas por vírgula)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="música, festival, internacional, jazz"
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Adicione palavras-chave que ajudem investidores a encontrar seu projeto
                    </p>
                  </div>
                </div>
              </div>

              {/* Imagem */}
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6 border-b pb-2">
                  Imagem do Projeto
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL da Imagem (opcional)
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => handleInputChange('image_url', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://exemplo.com/imagem.jpg"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Se não informada, uma imagem será gerada automaticamente com base na categoria
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
                >
                  {loading ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      Criando Projeto...
                    </>
                  ) : (
                    <>
                      <i className="ri-add-line mr-2"></i>
                      Criar Projeto
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
