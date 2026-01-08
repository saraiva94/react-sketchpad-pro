import { TranslatedMemberCard } from "@/components/TranslatedMemberCard";

interface ProjectMember {
  id: string;
  nome: string;
  funcao: string | null;
  email: string | null;
  telefone: string | null;
  photo_url: string | null;
  curriculum_url: string | null;
  social_links: {
    instagram?: string;
    linkedin?: string;
    facebook?: string;
    youtube?: string;
    twitter?: string;
    website?: string;
    imdb?: string;
    whatsapp?: string;
  } | null;
  detalhes?: string | null;
}

interface OrganizedGroup {
  type: 'large-pair' | 'large-with-smalls' | 'small-row';
  members: ProjectMember[];
}

interface SmartTeamGridProps {
  members: ProjectMember[];
  getInitials: (name: string | null) => string;
}

/**
 * Organiza membros da equipe de forma inteligente:
 * - Cards grandes (com descrição) aparecem primeiro
 * - Se último grande for ímpar, 2 pequenos ao lado
 * - Demais pequenos em grid 2x2
 */
const organizeTeamMembers = (members: ProjectMember[]): OrganizedGroup[] => {
  // Separar por tamanho (com descrição = grande)
  const largeCards = members.filter(m => 
    m.detalhes && m.detalhes.trim().length > 50
  );
  
  const smallCards = members.filter(m => 
    !m.detalhes || m.detalhes.trim().length <= 50
  );

  const organized: OrganizedGroup[] = [];
  const remainingSmalls = [...smallCards];
  
  // Processar cards grandes
  let i = 0;
  while (i < largeCards.length) {
    // Se é o último grande e é ímpar
    if (i === largeCards.length - 1 && largeCards.length % 2 !== 0) {
      // Último grande ímpar: adicionar com 2 pequenos ao lado
      if (remainingSmalls.length >= 2) {
        organized.push({
          type: 'large-with-smalls',
          members: [largeCards[i], ...remainingSmalls.splice(0, 2)]
        });
      } else {
        // Não há pequenos suficientes, apenas mostrar o grande
        organized.push({
          type: 'large-pair',
          members: [largeCards[i]]
        });
      }
      i++;
    } else {
      // Par de grandes
      organized.push({
        type: 'large-pair',
        members: largeCards.slice(i, i + 2)
      });
      i += 2;
    }
  }
  
  // Adicionar cards pequenos restantes (2 por linha)
  while (remainingSmalls.length > 0) {
    organized.push({
      type: 'small-row',
      members: remainingSmalls.splice(0, 2)
    });
  }
  
  return organized;
};

export function SmartTeamGrid({ members, getInitials }: SmartTeamGridProps) {
  const organized = organizeTeamMembers(members);

  return (
    <div className="space-y-4">
      {organized.map((group, groupIdx) => {
        if (group.type === 'large-pair') {
          // Par de cards grandes (ou 1 se sobrar)
          return (
            <div 
              key={`large-pair-${groupIdx}`}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {group.members.map(member => (
                <TranslatedMemberCard 
                  key={member.id} 
                  member={member} 
                  getInitials={getInitials} 
                />
              ))}
            </div>
          );
        }
        
        if (group.type === 'large-with-smalls') {
          // 1 card grande + 2 cards pequenos ao lado (empilhados verticalmente)
          // Layout: [Grande] [Pequeno1]
          //                  [Pequeno2]
          const [largeMember, ...smallMembers] = group.members;
          return (
            <div 
              key={`large-with-smalls-${groupIdx}`}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Card grande - altura automática que se ajusta */}
              <div className="h-full">
                <TranslatedMemberCard 
                  member={largeMember} 
                  getInitials={getInitials} 
                />
              </div>
              
              {/* 2 cards pequenos empilhados ao lado */}
              <div className="flex flex-col gap-4">
                {smallMembers.map(member => (
                  <TranslatedMemberCard 
                    key={member.id}
                    member={member} 
                    getInitials={getInitials}
                  />
                ))}
              </div>
            </div>
          );
        }
        
        if (group.type === 'small-row') {
          // Linha de cards pequenos (2 por linha)
          return (
            <div 
              key={`small-row-${groupIdx}`}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {group.members.map(member => (
                <TranslatedMemberCard 
                  key={member.id} 
                  member={member} 
                  getInitials={getInitials}
                />
              ))}
            </div>
          );
        }
        
        return null;
      })}
    </div>
  );
}
