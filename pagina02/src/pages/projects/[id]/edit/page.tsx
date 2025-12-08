import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../hooks/useAuth';
import { supabase } from '../../../../config/supabase';

interface ProjectFormData {
  title: string;
  description: string;
  category: string;
  budget: string;
  location: string;
  duration_months: string;
  requirements: string;
  timeline: string;
  expected_roi: string;
  risk_level: 'low' | 'medium' | 'high';
  tags: string[];
  image_url: string;
  contact_info: {
    email: string;
    phone: string;
    website?: string;
  };
}

const categories = [
  'Artes Integradas',
  'Artes Visuais', 
  'Audiovisual',
  'Circo',
  'Culturas Populares',
  'Dança',
  'Educação Cultural',
  'Eventos Culturais',
  'Literatura',
  'Música',
  'Outro',
  'Patrimônio Cultural',
  'Teatro'
];

const riskLevels = [
  { value: 'low', label: 'Baixo', color: 'green' },
  { value: 'medium', label: 'Médio', color: 'yellow' },
  { value: 'high', label: 'Alto', color: 'red' }
];

const defaultTags = [
  'Acessibilidade',
  'Adulto',
  'Cultura Popular',
  'Curta-metragem',
  'Diversidade',
  'Dança',
  'Educação',
  'Empoderamento Feminino',
  'Escola',
  'Espetáculo',
  'Exposição',
  'Festival',
  'Games',
  'LGBTQIA+',
  'Infância',
  'Infantil',
  'Inovação',
  'Instalação',
  'Juventude',
  'Juvenil',
  'Livro',
  'Longa-metragem',
  'Música',
  'Oficina',
  'Patrimônio',
  'Podcast',
  'Público Geral',
  'Questões Raciais',
  'Série',
  'Show',
  'Streaming',
  'Sustentabilidade',
  'TV',
  'Teatro',
  'Terceira Idade',
  'Videocast',
  'Workshop'
];

export default function EditProject() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    category: '',
    budget: '',
    location: '',
    duration_months: '',
    requirements: '',
    timeline: '',
    expected_roi: '',
    risk_level: 'medium',
    tags: [],
    image_url: '',
    contact_info: {
      email: '',
      phone: '',
      website: ''
    }
  });

  // Verificar se é administradora
  const isAdmin = user?.email === 'portobellofilmes@gmail.com';

  const loadProject = async () => {
    if (!id || !user || !isAdmin) return;

    setLoading(true);
    setError('');

    try {
      // ✅ ADMINISTRADORA PODE VER QUALQUER PROJETO
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', parseInt(id))
        .single();

      if (error) throw error;

      if (!data) {
        setError('Projeto não encontrado');
        return;
      }

      // Preencher formulário
      setFormData({
        title: data.title || '',
        description: data.description || '',
        category: data.category || '',
        budget: data.budget ? formatCurrency(data.budget) : '',
        location: data.location || '',
        duration_months: data.duration_months?.toString() || '',
        requirements: data.requirements || '',
        timeline: data.timeline || '',
        expected_roi: data.expected_roi?.toString() || '',
        risk_level: data.risk_level || 'medium',
        tags: data.tags || [],
        image_url: data.image_url || '',
        contact_info: data.contact_info || {
          email: data.contact_info?.email || user.email || '',
          phone: data.contact_info?.phone || '',
          website: data.contact_info?.website || ''
        }
      });
    } catch (error: any) {
      console.error('Erro ao carregar projeto:', error);
      setError('Erro ao carregar projeto para edição');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    if (field.startsWith('contact_info.')) {
      const contactField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contact_info: {
          ...prev.contact_info,
          [contactField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleTagToggle = (tag: string) => {
    setFormData(prev => {
      const currentTags = prev.tags;
      const isSelected = currentTags.includes(tag);

      if (isSelected) {
        return {
          ...prev,
          tags: currentTags.filter(t => t !== tag)
        };
      } else {
        if (currentTags.length >= 10) {
          return prev;
        }
        return {
          ...prev,
          tags: [...currentTags, tag]
        };
      }
    });
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const generateProjectImage = () => {
    const prompt = `Professional cultural project presentation for ${formData.category.toLowerCase()}, modern minimalist design with clean background, creative workspace atmosphere, artistic elements subtly integrated, professional lighting, contemporary aesthetic, suitable for investment presentation, high quality photography style, clean composition with space for text overlay`;

    const imageUrl = `https://readdy.ai/api/search-image?query=$%7BencodeURIComponent%28prompt%29%7D&width=800&height=600&seq=${Date.now()}&orientation=landscape`;

    setFormData(prev => ({
      ...prev,
      image_url: imageUrl
    }));
  };

  // ✅ NOVA ESTRATÉGIA SIMPLIFICADA DE SALVAMENTO
  const handleSubmit = async (status: 'draft' | 'active') => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Validação de administradora
      if (!isAdmin) {
        setError('❌ Acesso negado. Apenas a administradora pode editar projetos.');
        return;
      }

      // Validações básicas
      if (!formData.title.trim() || !formData.description.trim() || !formData.category) {
        setError('❌ Título, descrição e categoria são obrigatórios.');
        return;
      }

      // Processar orçamento
      let budgetValue = 0;
      try {
        const cleanBudget = formData.budget.replace(/[^\d,]/g, '').replace(',', '.');
        budgetValue = parseFloat(cleanBudget) || 0;
        if (budgetValue <= 0) {
          setError('❌ Orçamento deve ser maior que zero.');
          return;
        }
      } catch (error) {
        setError('❌ Formato de orçamento inválido.');
        return;
      }

      // Processar duração
      const durationValue = parseInt(formData.duration_months) || 0;
      if (durationValue <= 0) {
        setError('❌ Duração deve ser maior que zero.');
        return;
      }

      const roiValue = formData.expected_roi ? parseFloat(formData.expected_roi) : null;

      // Gerar imagem se necessário
      if (!formData.image_url) {
        generateProjectImage();
      }

      // ✅ USAR EDGE FUNCTION PARA BYPASS COMPLETO DE RLS
      const { data, error } = await supabase.functions.invoke('Create Project (Admin Bypass)', {
        body: {
          action: 'update',
          project_id: parseInt(id!),
          project_data: {
            title: formData.title.trim(),
            description: formData.description.trim(),
            category: formData.category,
            budget: budgetValue,
            location: formData.location.trim(),
            duration_months: durationValue,
            requirements: formData.requirements?.trim() || null,
            timeline: formData.timeline?.trim() || null,
            expected_roi: roiValue,
            risk_level: formData.risk_level,
            tags: formData.tags,
            image_url: formData.image_url || null,
            contact_info: {
              email: formData.contact_info.email?.trim() || '',
              phone: formData.contact_info.phone?.trim() || '',
              website: formData.contact_info.website?.trim() || null
            },
            status: status,
            updated_at: new Date().toISOString()
          },
          admin_user_id: user.id,
          admin_email: user.email
        }
      });

      if (error) {
        console.error('Erro na Edge Function:', error);
        setError(`❌ Erro ao salvar: ${error.message || 'Erro desconhecido'}`);
        return;
      }

      setSuccess('✅ Projeto atualizado com sucesso!');
      
      setTimeout(() => {
        navigate(`/projects/${id}`);
      }, 2000);

    } catch (error: any) {
      console.error('Erro crítico:', error);
      setError(`❌ Erro inesperado: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!authLoading && user && !isAdmin) {
      navigate('/dashboard');
    } else if (user && isAdmin) {
      loadProject();
    }
  }, [user, authLoading, id, navigate, isAdmin]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line text-4xl text-blue-600 animate-spin mb-4"></i>
          <p className="text-gray-600">Carregando projeto...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-shield-line text-4xl text-red-600 mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Acesso Restrito</h2>
          <p className="text-gray-600 mb-6">Apenas a administradora pode editar projetos.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-arrow-left-line mr-2"></i>
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-error-warning-line text-4xl text-red-600 mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Erro ao carregar projeto</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-arrow-left-line mr-2"></i>
            Voltar ao Dashboard
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
              <a href="/" className="text-2xl font-bold text-blue-600" style={{ fontFamily: 'Pacifico, serif' }}>
                Porto de Ideias
              </a>
              <div className="h-6 w-px bg-gray-300"></div>
              <span className="text-gray-600">Editar Projeto</span>
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 px-3 py-1 rounded-full border border-purple-200">
                <span className="text-xs text-purple-700 font-medium flex items-center">
                  <i className="ri-vip-crown-fill mr-1"></i>
                  Modo Administradora
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/projects/${id}`)}
                className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
              >
                <i className="ri-arrow-left-line mr-2"></i>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
              <i className="ri-edit-line mr-3 text-blue-600"></i>
              Editar Projeto
            </h1>
            <p className="text-gray-600">
              Como administradora, você pode editar qualquer projeto da plataforma
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
              <div className="flex items-start">
                <i className="ri-error-warning-line text-xl mr-2 mt-0.5"></i>
                <div>{error}</div>
              </div>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="space-y-8">
              {/* Informações Básicas */}
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-6">Informações Básicas</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título do Projeto *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={e => handleInputChange('title', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: Festival de Música Independente 2025"
                      maxLength={100}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.title.length}/100 caracteres
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria *
                    </label>
                    <select
                      value={formData.category}
                      onChange={e => handleInputChange('category', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição do Projeto *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={e => handleInputChange('description', e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Descreva o projeto cultural de forma detalhada..."
                      maxLength={1000}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.description.length}/1000 caracteres
                    </p>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags do Projeto
                    </label>
                    <p className="text-xs text-gray-500 mb-3">
                      Selecione até 10 tags que melhor descrevem o projeto
                    </p>

                    <div className="space-y-3">
                      <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {defaultTags.map(tag => (
                            <label
                              key={tag}
                              className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                                formData.tags.includes(tag)
                                  ? 'bg-blue-50 border border-blue-200'
                                  : 'border border-transparent hover:border-gray-200'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.tags.includes(tag)}
                                onChange={() => handleTagToggle(tag)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                disabled={!formData.tags.includes(tag) && formData.tags.length >= 10}
                              />
                              <span
                                className={`text-sm select-none ${
                                  formData.tags.includes(tag)
                                    ? 'text-blue-800 font-medium'
                                    : 'text-gray-700'
                                }`}
                              >
                                {tag}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {formData.tags.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700">
                              Tags Selecionadas
                            </label>
                            <span className="text-xs text-gray-500">
                              {formData.tags.length}/10 selecionadas
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                            {formData.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTag(tag)}
                                  className="ml-2 text-blue-600 hover:text-blue-800 cursor-pointer w-4 h-4 flex items-center justify-center rounded-full hover:bg-blue-200 transition-colors"
                                  title="Remover tag"
                                >
                                  <i className="ri-close-line text-xs"></i>
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Orçamento e Localização */}
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Orçamento e Localização
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Orçamento Total *
                    </label>
                    <input
                      type="text"
                      value={formData.budget}
                      onChange={e => {
                        const value = e.target.value.replace(/\D/g, '');
                        const formatted = new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(parseFloat(value) / 100 || 0);
                        handleInputChange('budget', formatted);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="R$ 0,00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duração (meses) *
                    </label>
                    <input
                      type="number"
                      value={formData.duration_months}
                      onChange={e => handleInputChange('duration_months', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 6"
                      min="1"
                      max="60"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Localização *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => handleInputChange('location', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: São Paulo, SP"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ROI Esperado (%)
                    </label>
                    <input
                      type="number"
                      value={formData.expected_roi}
                      onChange={e => handleInputChange('expected_roi', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ex: 15"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nível de Risco
                    </label>
                    <select
                      value={formData.risk_level}
                      onChange={e => handleInputChange('risk_level', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-8"
                    >
                      {riskLevels.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label} Risco
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </section>

              {/* Detalhes do Projeto */}
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Detalhes do Projeto
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Requisitos e Pré-condições
                    </label>
                    <textarea
                      value={formData.requirements}
                      onChange={e => handleInputChange('requirements', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Descreva os requisitos técnicos, recursos necessários..."
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.requirements.length}/500 caracteres
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cronograma e Marcos
                    </label>
                    <textarea
                      value={formData.timeline}
                      onChange={e => handleInputChange('timeline', e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      placeholder="Detalhe as principais etapas e marcos do projeto..."
                      maxLength={800}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.timeline.length}/800 caracteres
                    </p>
                  </div>
                </div>
              </section>

              {/* Informações de Contato */}
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Informações de Contato
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email de Contato *
                    </label>
                    <input
                      type="email"
                      value={formData.contact_info.email}
                      onChange={e => handleInputChange('contact_info.email', e.target.value)}
                      className="w-full px-1 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="contato@exemplo.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      value={formData.contact_info.phone}
                      onChange={e => {
                        const formattedPhone = formatPhoneNumber(e.target.value);
                        handleInputChange('contact_info.phone', formattedPhone);
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="(11) 99999-9999"
                      maxLength={15}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Digite seu telefone com DDD. Exemplo: (11) 99999-9999
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website/Portfolio (opcional)
                  </label>
                  <input
                    type="url"
                    value={formData.contact_info.website}
                    onChange={e => handleInputChange('contact_info.website', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://seusite.com.br"
                  />
                </div>
              </section>

              {/* Imagem do Projeto */}
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Imagem do Projeto
                </h2>
                <div className="space-y-4">
                  {formData.image_url && (
                    <div className="w-full max-w-md">
                      <img
                        src={formData.image_url}
                        alt="Preview do projeto"
                        className="w-full h-48 object-cover object-top rounded-lg border"
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={generateProjectImage}
                    className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-refresh-line mr-2"></i>
                    {formData.image_url ? 'Gerar Nova Imagem' : 'Gerar Imagem'}
                  </button>
                </div>
              </section>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t">
              <button
                onClick={() => navigate(`/projects/${id}`)}
                className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
              >
                <i className="ri-arrow-left-line mr-2"></i>
                Cancelar
              </button>

              <div className="flex space-x-4">
                <button
                  onClick={() => handleSubmit('draft')}
                  disabled={saving}
                  className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {saving ? (
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                  ) : (
                    <i className="ri-save-line mr-2"></i>
                  )}
                  Salvar como Rascunho
                </button>
                <button
                  onClick={() => handleSubmit('active')}
                  disabled={saving}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {saving ? (
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                  ) : (
                    <i className="ri-check-line mr-2"></i>
                  )}
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
