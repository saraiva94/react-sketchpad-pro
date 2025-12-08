import { useState } from 'react';
import { UserNav } from '../../components/feature/UserNav';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigate = (path: string) => {
    if (typeof window !== 'undefined' && window.REACT_APP_NAVIGATE) {
      window.REACT_APP_NAVIGATE(path);
    } else {
      window.location.href = path;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold text-blue-600" style={{ fontFamily: "Pacifico, serif" }}>
                Porto de Ideias
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#home" className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap">Início</a>
              <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap">Sobre</a>
              <a href="#platform" className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap">Plataforma</a>
              <a href="/projects" className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap" onClick={() => handleNavigate('/projects')}>Projetos</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap">Contato</a>
              
              {/* User Navigation */}
              <UserNav onNavigate={handleNavigate} />
            </div>

            <button 
              className="md:hidden w-6 h-6 flex items-center justify-center cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <i className={`ri-${isMenuOpen ? 'close' : 'menu'}-line text-xl`}></i>
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-100">
              <div className="flex flex-col space-y-4 pt-4">
                <a href="#home" className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">Início</a>
                <a href="#about" className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">Sobre</a>
                <a href="#platform" className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">Plataforma</a>
                <a href="/projects" className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer" onClick={() => handleNavigate('/projects')}>Projetos</a>
                <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">Contato</a>
                <div className="pt-2">
                  <UserNav onNavigate={handleNavigate} />
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20 lg:py-32">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
             style={{ 
               backgroundImage: `url(https://readdy.ai/api/search-image?query=Centro%20cultural%20brasileiro%20moderno%20com%20artistas%20diversos%2C%20empreendedores%20e%20investidores%20colaborando%20em%20um%20espa%C3%A7o%20de%20trabalho%20inspirador%20e%20luminoso%20com%20livros%2C%20instala%C3%A7%C3%B5es%20art%C3%ADsticas%20e%20projetos%20criativos%20nas%20paredes%2C%20arquitetura%20contempor%C3%A2nea%20com%20grandes%20janelas%20e%20luz%20natural&width=1200&height=800&seq=hero-bg-br-1&orientation=landscape)` 
             }}>
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6 leading-tight">
              Onde a Cultura Encontra o <span className="text-blue-600">Investimento</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Conectando o setor cultural com empreendedores e investidores, criando um espaço onde projetos ganham visibilidade e se conectam com os parceiros certos.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button 
                onClick={() => handleNavigate('/auth')}
                className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap shadow-lg"
              >
                Cadastre seu Projeto Agora
              </button>
              <button 
                onClick={() => handleNavigate('/projects')}
                className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
              >
                Descubra Projetos para Apoiar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section id="projects" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Projetos Culturais em Destaque</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Descubra iniciativas culturais inovadoras que buscam oportunidades de investimento e parceria.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => handleNavigate('/projects/1')}>
              <img 
                src="https://readdy.ai/api/search-image?query=Galeria%20de%20arte%20contempor%C3%A2nea%20brasileira%20com%20pinturas%20e%20esculturas%20modernas%2C%20visitantes%20apreciando%20obras%20de%20arte%2C%20paredes%20brancas%20limpas%20e%20ilumina%C3%A7%C3%A3o%20profissional%2C%20atmosfera%20cultural%20e%20art%C3%ADstica&width=400&height=250&seq=projeto-br-1&orientation=landscape"
                alt="Galeria de Arte Contemporânea"
                className="w-full h-48 object-cover object-top"
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">Artes Visuais</span>
                  <span className="text-gray-500 text-sm">São Paulo</span>
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-3">Galeria de Arte Contemporânea</h3>
                <p className="text-gray-600 mb-4">Um espaço de galeria moderna dedicado a artistas contemporâneos emergentes, oferecendo oportunidades de exposição e programas de educação cultural.</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    <span className="text-sm text-gray-600">Maria Santos</span>
                  </div>
                  <span className="text-blue-600 font-semibold cursor-pointer hover:text-blue-700">Ver Detalhes</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => handleNavigate('/projects/2')}>
              <img 
                src="https://readdy.ai/api/search-image?query=Teatro%20comunit%C3%A1rio%20brasileiro%20com%20atores%20no%20palco%2C%20p%C3%BAblico%20diverso%20apreciando%20o%20espet%C3%A1culo%2C%20ilumina%C3%A7%C3%A3o%20teatral%20calorosa%20e%20assentos%20confort%C3%A1veis%2C%20local%20de%20entretenimento%20cultural&width=400&height=250&seq=projeto-br-2&orientation=landscape"
                alt="Iniciativa de Teatro Comunitário"
                className="w-full h-48 object-cover object-top"
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">Teatro</span>
                  <span className="text-gray-500 text-sm">Rio de Janeiro</span>
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-3">Iniciativa de Teatro Comunitário</h3>
                <p className="text-gray-600 mb-4">Construindo um espaço teatral comunitário que reúne talentos locais e oferece entretenimento cultural acessível para todas as idades.</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    <span className="text-sm text-gray-600">João Silva</span>
                  </div>
                  <span className="text-blue-600 font-semibold cursor-pointer hover:text-blue-700">Ver Detalhes</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => handleNavigate('/projects/3')}>
              <img 
                src="https://readdy.ai/api/search-image?query=Festival%20de%20m%C3%BAsica%20brasileira%20ao%20ar%20livre%20com%20m%C3%BAsicos%20diversos%20se%20apresentando%2C%20multid%C3%A3o%20entusiasmada%20curtindo%20m%C3%BAsica%20ao%20vivo%2C%20ilumina%C3%A7%C3%A3o%20colorida%20do%20palco%20e%20atmosfera%20de%20celebra%C3%A7%C3%A3o%20cultural%2C%20encontro%20comunit%C3%A1rio&width=400&height=250&seq=projeto-br-3&orientation=landscape"
                alt="Festival Cultural de Música"
                className="w-full h-48 object-cover object-top"
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">Música</span>
                  <span className="text-gray-500 text-sm">Belo Horizonte</span>
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-3">Festival Cultural de Música</h3>
                <p className="text-gray-600 mb-4">Festival anual celebrando tradições musicais regionais enquanto promove artistas emergentes e diversidade cultural em nossa comunidade.</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    <span className="text-sm text-gray-600">Ana Costa</span>
                  </div>
                  <span className="text-blue-600 font-semibold cursor-pointer hover:text-blue-700">Ver Detalhes</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <button 
              onClick={() => handleNavigate('/projects')}
              className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-blue-600 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Ver Todos os Projetos
            </button>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">Nossa Missão</h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-12">
              Nossa missão é simples, mas transformadora: garantir que as iniciativas culturais recebam a atenção que merecem, aproximando criadores daqueles que podem apoiar, financiar e fortalecer a cultura.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-lightbulb-line text-2xl text-white"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Para Criadores</h3>
                <p className="text-gray-600">
                  Mostre seu projeto para quem pode investir de verdade. Não mais apresentações perdidas ou projetos esquecidos em gavetas.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-handshake-line text-2xl text-white"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Para Investidores</h3>
                <p className="text-gray-600">
                  💰 Encontre oportunidades culturais seguras e bem estruturadas. Projetos curados, sérios e prontos para decolar.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="ri-growth-line text-2xl text-white"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Para Todos</h3>
                <p className="text-gray-600">
                  🌟 Criamos um ciclo virtuoso: cultura ganha força, investidores encontram propósito, e a sociedade se beneficia.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section id="platform" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">Um Ecossistema de Conexões</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Mais que uma vitrine, somos um porto seguro onde as ideias atracam, ganham força e partem para o mundo.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Combined Section for Producers */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Para Produtores Culturais</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="ri-presentation-line text-white text-xl"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Vitrine de Projetos</h4>
                      <p className="text-gray-600">Apresente suas iniciativas culturais com visibilidade profissional e informações detalhadas do projeto.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="ri-shield-check-line text-white text-xl"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Credibilidade e Confiança</h4>
                      <p className="text-gray-600">Construa confiança com perfis verificados e documentação abrangente do projeto.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="ri-bar-chart-line text-white text-xl"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Dashboard Completo</h4>
                      <p className="text-gray-600">Acompanhe visualizações, favoritos e conexões solicitadas em tempo real.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <img 
                  src="https://readdy.ai/api/search-image?query=Artistas%20criativos%20e%20produtores%20culturais%20brasileiros%20trabalhando%20juntos%20em%20um%20est%C3%BAdio%20moderno%2C%20exibindo%20seus%20projetos%20art%C3%ADsticos%2C%20pinturas%2C%20esculturas%20e%20obras%20culturais%20em%20cavaletes%20e%20paredes%2C%20atmosfera%20colaborativa%20e%20inspiradora%20com%20ilumina%C3%A7%C3%A3o%20natural&width=600&height=500&seq=produtores-br-1&orientation=landscape"
                  alt="Produtores Culturais"
                  className="w-full h-80 object-cover object-top rounded-2xl shadow-xl"
                />
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center mt-20">
              <div className="lg:order-2">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Para Empreendedores e Investidores</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="ri-search-eye-line text-white text-xl"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Seleção Curada</h4>
                      <p className="text-gray-600">Acesso a uma seleção cuidadosamente curada de propostas culturais sérias, criativas e bem estruturadas.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="ri-file-shield-line text-white text-xl"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Marco Legal</h4>
                      <p className="text-gray-600">Projetos prontos para financiamento através de leis de incentivo cultural ou patrocínio direto.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="ri-heart-line text-white text-xl"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Dashboard Personalizado</h4>
                      <p className="text-gray-600">Gerencie projetos salvos, histórico de contatos e relatórios de impacto das iniciativas apoiadas.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:order-1 relative">
                <img 
                  src="https://readdy.ai/api/search-image?query=Reuni%C3%A3o%20de%20neg%C3%B3cios%20profissional%20com%20empreendedores%20e%20investidores%20brasileiros%20revisando%20propostas%20de%20projetos%20culturais%2C%20ambiente%20de%20escrit%C3%B3rio%20moderno%20com%20laptops%2C%20documentos%20e%20materiais%20de%20apresenta%C3%A7%C3%A3o%2C%20grupo%20diverso%20de%20profissionais%20em%20discuss%C3%A3o&width=600&height=500&seq=investidores-br-1&orientation=landscape"
                  alt="Empreendedores e Investidores"
                  className="w-full h-80 object-cover object-top rounded-2xl shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">150+</div>
              <div className="text-blue-100">Projetos Culturais</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">85</div>
              <div className="text-blue-100">Investidores Ativos</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">R$ 10M</div>
              <div className="text-blue-100">Total Financiado</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">92%</div>
              <div className="text-blue-100">Taxa de Sucesso</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Pronto para Transformar o Investimento Cultural?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Entre no Porto de Ideias hoje e faça parte de um ecossistema onde a cultura encontra o investimento, e o investimento encontra propósito.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button 
                onClick={() => handleNavigate('/auth')}
                className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap shadow-lg"
              >
                Cadastre seu Projeto Agora
              </button>
              <button 
                onClick={() => handleNavigate('/projects')}
                className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                Descubra Projetos para Apoiar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <div className="text-2xl font-bold mb-4" style={{ fontFamily: "Pacifico, serif" }}>
                Porto de Ideias
              </div>
              <p className="text-gray-400 mb-4">
                O Porto de Ideias é uma iniciativa da Porto Bello Filmes, criada para aproximar cultura e investimento.
              </p>
              <p className="text-gray-400 mb-6 text-sm">
                Onde a cultura encontra o investimento, e o investimento encontra propósito.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                  <i className="ri-facebook-fill text-white"></i>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                  <i className="ri-twitter-fill text-white"></i>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                  <i className="ri-instagram-fill text-white"></i>
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                  <i className="ri-linkedin-fill text-white"></i>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Plataforma</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Como Funciona</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Enviar Projeto</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Encontrar Investidores</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Histórias de Sucesso</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Suporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors cursor-pointer">Privacidade</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Contato</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center space-x-2">
                  <i className="ri-mail-line"></i>
                  <span>portobellofilmes@gmail.com</span>
                </li>
                <li className="flex items-center space-x-2">
                  <i className="ri-phone-line"></i>
                  <span>+55 (11) 9999-9999</span>
                </li>
                <li className="flex items-center space-x-2">
                  <i className="ri-map-pin-line"></i>
                  <span>São Paulo, Brasil</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Porto de Ideias. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}