import type { SalesLibraryState } from "./sales-library-types";

// Source: cahier des charges commercial fourni le 26 octobre 2026.
// EMAIL 06: mention de pièce jointe remplacée par « Voici notre proposition… ».
// Signatures remplacées par variables centrales; fiches argumentaires complétées
// par des formulations prudentes et des prestations à préciser, sans données prospect inventées.
export const SALES_SEED_PROVENANCE = "user-spec-2026-10-26-v1; email06-no-attachment-claim; centralized-signatures; argument-completions";
export function initialSalesLibrary(): SalesLibraryState {
  return {
  "templates": [
    {
      "id": "email-01",
      "title": "Premier contact propriétaire",
      "description": "Email 01 — Premier contact propriétaire",
      "categoryId": "emails",
      "subject": "Votre villa à {{zone}} — {{entreprise}}",
      "content": "Bonjour {{civilite}} {{nom}},\n\nJe me permets de vous contacter au sujet de votre villa située à {{zone}}.\n\nJe représente {{entreprise}}, une conciergerie basée en {{zone_zenvilla}}, spécialisée dans l'accompagnement des propriétaires de locations saisonnières.\n\nNous intervenons notamment sur l'accueil des voyageurs, les arrivées et départs, le ménage, l'entretien et, selon les besoins, la gestion des réservations.\n\nL'idée est simple : vous permettre de profiter de votre bien sans avoir à gérer toutes les contraintes opérationnelles.\n\nJe serais intéressé de savoir comment vous organisez actuellement la gestion de votre villa.\n\nSeriez-vous disponible pour un échange de 10 à 15 minutes cette semaine ou la semaine prochaine ?\n\nBien cordialement,\n\nL'équipe {{entreprise}}\n{{telephone_zenvilla}}\n{{email_zenvilla}}\n{{site_zenvilla}}",
      "sections": [],
      "status": "active",
      "position": 10,
      "updatedAt": "2026-10-26T00:00:00.000Z"
    },
    {
      "id": "email-02",
      "title": "Propriétaire qui gère seul",
      "description": "Email 02 — Propriétaire qui gère seul",
      "categoryId": "emails",
      "subject": "Un peu moins de gestion pour votre villa à {{zone}} ?",
      "content": "Bonjour {{civilite}} {{nom}},\n\nGérer soi-même une location saisonnière demande du temps, particulièrement lors des changements de voyageurs : ménage, remise des clés, contrôle du logement et imprévus.\n\nChez {{entreprise}}, nous accompagnons les propriétaires qui souhaitent déléguer certaines de ces tâches, sans nécessairement confier toute leur gestion locative.\n\nNotre approche est personnalisée, en fonction du fonctionnement de chaque villa.\n\nEst-ce que la gestion des arrivées, des départs ou du ménage représente aujourd'hui une contrainte pour vous ?\n\nSi oui, je serais ravi d'en discuter pendant 10 minutes.\n\nBien cordialement,\n\nL'équipe {{entreprise}}\n{{telephone_zenvilla}}\n{{site_zenvilla}}",
      "sections": [],
      "status": "active",
      "position": 20,
      "updatedAt": "2026-10-26T00:00:00.000Z"
    },
    {
      "id": "email-03",
      "title": "Propriétaire absent de Corse",
      "description": "Email 03 — Propriétaire absent de Corse",
      "categoryId": "emails",
      "subject": "Qui s'occupe de votre villa lorsque vous êtes absent ?",
      "content": "Bonjour {{civilite}} {{nom}},\n\nPosséder une villa en Corse tout en résidant ailleurs peut rendre l'organisation des locations saisonnières plus compliquée.\n\nChez {{entreprise}}, nous proposons un accompagnement local pour les propriétaires souhaitant déléguer l'accueil des voyageurs, le ménage, le suivi de leur logement et la coordination des interventions nécessaires.\n\nNotre objectif est que votre villa soit suivie avec sérieux, même lorsque vous êtes loin.\n\nComment gérez-vous actuellement ces aspects ?\n\nJe vous propose un échange téléphonique de 10 à 15 minutes pour voir si nous pourrions vous apporter une solution adaptée.\n\nBien cordialement,\n\nL'équipe {{entreprise}}\n{{telephone_zenvilla}}\n{{site_zenvilla}}",
      "sections": [],
      "status": "active",
      "position": 30,
      "updatedAt": "2026-10-26T00:00:00.000Z"
    },
    {
      "id": "email-04",
      "title": "Après un premier échange",
      "description": "Email 04 — Après un premier échange",
      "categoryId": "emails",
      "subject": "Suite à notre échange — {{entreprise}}",
      "content": "Bonjour {{prenom}},\n\nMerci pour notre échange concernant votre villa à {{zone}}.\n\nJ'ai bien retenu les points suivants :\n\nVotre organisation actuelle : {{organisation_actuelle}}\n\nVos principales contraintes : {{besoins}}\n\nLes prestations qui pourraient vous intéresser : {{services}}\n\nChez {{entreprise}}, nous pouvons étudier une solution adaptée à vos besoins, sans vous imposer une formule qui ne correspondrait pas à votre fonctionnement.\n\nJe vous propose de poursuivre notre discussion lors d'un rendez-vous de 15 minutes, afin de préciser les prestations souhaitées et les modalités d'intervention.\n\nSeriez-vous disponible {{creneau_1}} ou {{creneau_2}} ?\n\nBien cordialement,\n\nL'équipe {{entreprise}}\n{{telephone_zenvilla}}",
      "sections": [],
      "status": "active",
      "position": 40,
      "updatedAt": "2026-10-26T00:00:00.000Z"
    },
    {
      "id": "email-05",
      "title": "Relance après premier contact",
      "description": "Email 05 — Relance après premier contact",
      "categoryId": "emails",
      "subject": "Suite à mon message concernant votre villa",
      "content": "Bonjour {{civilite}} {{nom}},\n\nJe me permets de revenir vers vous concernant mon précédent message au sujet de votre villa à {{zone}}.\n\nChez {{entreprise}}, nous accompagnons les propriétaires sur la gestion opérationnelle de leurs locations saisonnières, avec des prestations adaptées à leurs besoins.\n\nSi vous gérez déjà votre logement, nous pouvons également intervenir sur des besoins ponctuels, comme les arrivées et départs ou le ménage.\n\nSeriez-vous ouvert à un court échange pour faire connaissance et voir si notre accompagnement pourrait vous être utile ?\n\nSi ce n'est pas d'actualité, aucun souci.\n\nBien cordialement,\n\nL'équipe {{entreprise}}\n{{telephone_zenvilla}}",
      "sections": [],
      "status": "active",
      "position": 50,
      "updatedAt": "2026-10-26T00:00:00.000Z"
    },
    {
      "id": "email-06",
      "title": "Proposition commerciale",
      "description": "Email 06 — Proposition commerciale",
      "categoryId": "emails",
      "subject": "Votre proposition personnalisée — {{entreprise}}",
      "content": "Bonjour {{prenom}},\n\nVoici notre proposition pour l'accompagnement de votre villa à {{zone}}.\n\nElle reprend les prestations que nous avons évoquées :\n\n{{prestations_proposees}}\n\nLes modalités et les tarifs ont été définis en fonction des besoins de votre logement et de son organisation.\n\nJe reste disponible pour répondre à vos questions ou ajuster certains éléments.\n\nNous pouvons également prévoir un court échange pour parcourir la proposition ensemble.\n\nBien cordialement,\n\nL'équipe {{entreprise}}\n{{telephone_zenvilla}}\n{{site_zenvilla}}",
      "sections": [],
      "status": "active",
      "position": 60,
      "updatedAt": "2026-10-26T00:00:00.000Z"
    },
    {
      "id": "appel-01",
      "title": "Premier contact",
      "description": "Appel 01 — Premier contact",
      "categoryId": "appels",
      "subject": "",
      "content": "",
      "sections": [
        {
          "id": "section-1",
          "title": "Objectif",
          "content": "Obtenir un rendez-vous."
        },
        {
          "id": "section-2",
          "title": "Ouverture",
          "content": "« Bonjour, je suis de {{entreprise}}, une conciergerie en {{zone_zenvilla}}. Je vous appelle au sujet de votre villa à {{zone}}. Est-ce que je vous dérange ? »"
        },
        {
          "id": "section-3",
          "title": "Découverte",
          "content": "« Comment organisez-vous aujourd'hui l'accueil des voyageurs et l'entretien de votre villa ? »\n\n« Est-ce que vous vous occupez personnellement des locations ou avez-vous déjà quelqu'un sur place ? »"
        },
        {
          "id": "section-4",
          "title": "Présentation",
          "content": "« Chez {{entreprise}}, nous pouvons prendre en charge uniquement les prestations dont vous avez besoin, du ménage aux arrivées et départs, jusqu'à un accompagnement plus complet. »"
        },
        {
          "id": "section-5",
          "title": "Conclusion",
          "content": "« Plutôt que de tout détailler maintenant, je vous propose qu'on prenne 15 minutes pour comprendre votre fonctionnement et voir si nous pouvons vous apporter quelque chose. Vous seriez plus disponible en début ou en fin de semaine ? »"
        }
      ],
      "status": "active",
      "position": 10,
      "updatedAt": "2026-10-26T00:00:00.000Z"
    },
    {
      "id": "appel-02",
      "title": "Propriétaire déjà accompagné",
      "description": "Appel 02 — Propriétaire déjà accompagné",
      "categoryId": "appels",
      "subject": "",
      "content": "",
      "sections": [
        {
          "id": "section-1",
          "title": "Objectif",
          "content": "Identifier une éventuelle insatisfaction ou un besoin complémentaire."
        },
        {
          "id": "section-2",
          "title": "Question",
          "content": "« Je comprends. Et globalement, vous êtes satisfait de leur accompagnement ? »"
        },
        {
          "id": "section-3",
          "title": "Si satisfait",
          "content": "« Très bien. L'idée n'est pas de remplacer un prestataire qui vous convient. Si vous avez ponctuellement besoin d'un renfort ou d'une prestation complémentaire, est-ce que cela pourrait vous intéresser ? »"
        },
        {
          "id": "section-4",
          "title": "Si insatisfait",
          "content": "« Qu'est-ce qui pourrait être amélioré dans votre organisation actuelle ? »"
        },
        {
          "id": "section-5",
          "title": "Conclusion",
          "content": "Proposer un rendez-vous uniquement si un besoin réel apparaît."
        }
      ],
      "status": "active",
      "position": 20,
      "updatedAt": "2026-10-26T00:00:00.000Z"
    },
    {
      "id": "appel-03",
      "title": "Découverte approfondie",
      "description": "Appel 03 — Découverte approfondie",
      "categoryId": "appels",
      "subject": "",
      "content": "",
      "sections": [
        {
          "id": "section-1",
          "title": "Objectif",
          "content": "Qualifier le besoin avant devis."
        },
        {
          "id": "section-2",
          "title": "Questions",
          "content": "1. Votre villa est-elle louée toute l'année ou principalement en saison ?\n2. Combien de chambres et de voyageurs peut-elle accueillir ?\n3. Comment organisez-vous les arrivées et les départs ?\n4. Qui s'occupe actuellement du ménage et du linge ?\n5. Quels sont les principaux problèmes que vous rencontrez ?\n6. Souhaitez-vous déléguer toute la gestion ou seulement certaines prestations ?\n7. Quand souhaiteriez-vous mettre une nouvelle organisation en place ?"
        },
        {
          "id": "section-3",
          "title": "Conclusion",
          "content": "Reformuler les besoins, confirmer les prestations recherchées et convenir d'un rendez-vous ou d'une visite."
        }
      ],
      "status": "active",
      "position": 30,
      "updatedAt": "2026-10-26T00:00:00.000Z"
    },
    {
      "id": "appel-04",
      "title": "Suivi après devis",
      "description": "Appel 04 — Suivi après devis",
      "categoryId": "appels",
      "subject": "",
      "content": "",
      "sections": [
        {
          "id": "section-1",
          "title": "Objectif",
          "content": "Comprendre la décision du propriétaire."
        },
        {
          "id": "section-2",
          "title": "Ouverture",
          "content": "« Bonjour {{prenom}}, je vous appelle au sujet de la proposition {{entreprise}} que nous vous avons transmise. Avez-vous eu le temps de la consulter ? »"
        },
        {
          "id": "section-3",
          "title": "Question",
          "content": "« Est-ce que les prestations correspondent à ce que vous aviez en tête, ou y a-t-il des points que vous souhaiteriez ajuster ? »"
        },
        {
          "id": "section-4",
          "title": "Conclusion",
          "content": "Répondre aux questions et définir une prochaine étape, sans pression commerciale excessive."
        }
      ],
      "status": "active",
      "position": 40,
      "updatedAt": "2026-10-26T00:00:00.000Z"
    },
    {
      "id": "whatsapp-01",
      "title": "Après premier appel",
      "description": "Whatsapp 01 — Après premier appel",
      "categoryId": "whatsapp",
      "subject": "",
      "content": "Bonjour {{prenom}}, c'est l'équipe {{entreprise}}.\n\nMerci pour notre échange concernant votre villa à {{zone}}.\n\nComme convenu, voici notre site pour découvrir nos prestations :\n{{site_zenvilla}}\n\nJe reste disponible si vous avez des questions.\n\nBonne journée !",
      "sections": [],
      "status": "active",
      "position": 10,
      "updatedAt": "2026-10-26T00:00:00.000Z"
    },
    {
      "id": "whatsapp-02",
      "title": "Confirmation de rendez-vous",
      "description": "Whatsapp 02 — Confirmation de rendez-vous",
      "categoryId": "whatsapp",
      "subject": "",
      "content": "Bonjour {{prenom}},\n\nJe vous confirme notre rendez-vous du {{date_rdv}} à {{heure_rdv}} pour discuter de la gestion de votre villa.\n\nAu plaisir d'échanger avec vous !\n\nL'équipe {{entreprise}}",
      "sections": [],
      "status": "active",
      "position": 20,
      "updatedAt": "2026-10-26T00:00:00.000Z"
    },
    {
      "id": "whatsapp-03",
      "title": "Relance après échange",
      "description": "Whatsapp 03 — Relance après échange",
      "categoryId": "whatsapp",
      "subject": "",
      "content": "Bonjour {{prenom}},\n\nJe reviens vers vous comme convenu concernant les prestations {{entreprise}} pour votre logement à {{zone}}.\n\nAvez-vous eu le temps de réfléchir aux services qui pourraient vous être utiles ?\n\nJe reste disponible pour en discuter.",
      "sections": [],
      "status": "active",
      "position": 30,
      "updatedAt": "2026-10-26T00:00:00.000Z"
    },
    {
      "id": "whatsapp-04",
      "title": "Après devis",
      "description": "Whatsapp 04 — Après devis",
      "categoryId": "whatsapp",
      "subject": "",
      "content": "Bonjour {{prenom}},\n\nJe voulais simplement vérifier que vous aviez bien reçu notre proposition personnalisée pour votre villa.\n\nN'hésitez pas à me dire si vous souhaitez modifier certaines prestations ou obtenir des précisions.\n\nBonne journée,\n{{entreprise}}",
      "sections": [],
      "status": "active",
      "position": 40,
      "updatedAt": "2026-10-26T00:00:00.000Z"
    },
    {
      "id": "whatsapp-05",
      "title": "Reprise de contact avant saison",
      "description": "Whatsapp 05 — Reprise de contact avant saison",
      "categoryId": "whatsapp",
      "subject": "",
      "content": "Bonjour {{prenom}},\n\nJ'espère que vous allez bien.\n\nNous avions échangé au sujet de votre villa à {{zone}}. Je souhaitais savoir si votre organisation pour la prochaine saison était désormais définie.\n\nSi vous avez encore besoin d'aide pour le ménage, les arrivées et départs ou la gestion des locations, nous pouvons en reparler.\n\nBelle journée,\n{{entreprise}}",
      "sections": [],
      "status": "active",
      "position": 50,
      "updatedAt": "2026-10-26T00:00:00.000Z"
    },
    {
      "id": "argument-01",
      "title": "Tranquillité d'esprit",
      "description": "Argument 01 — Tranquillité d'esprit",
      "categoryId": "argumentaires",
      "subject": "",
      "content": "",
      "sections": [
        {
          "id": "section-1",
          "title": "Promesse",
          "content": "Déléguer les contraintes opérationnelles de sa location saisonnière."
        },
        {
          "id": "section-2",
          "title": "Bénéfices",
          "content": "Moins de coordination, moins de tâches quotidiennes et un interlocuteur pour organiser les prestations."
        },
        {
          "id": "section-3",
          "title": "Prestations",
          "content": "Accueil, ménage, départs, entretien et coordination des interventions."
        },
        {
          "id": "section-4",
          "title": "Question",
          "content": "« Qu'est-ce qui vous prend le plus de temps dans la gestion de votre villa ? »"
        },
        {
          "id": "formulation",
          "title": "Formulation commerciale",
          "content": "Nous pouvons organiser les prestations que vous souhaitez déléguer afin de vous libérer du temps."
        }
      ],
      "status": "active",
      "position": 10,
      "updatedAt": "2026-10-26T00:00:00.000Z"
    },
    {
      "id": "argument-02",
      "title": "Flexibilité",
      "description": "Argument 02 — Flexibilité",
      "categoryId": "argumentaires",
      "subject": "",
      "content": "",
      "sections": [
        {
          "id": "section-1",
          "title": "Promesse",
          "content": "Un accompagnement adapté aux besoins réels du propriétaire."
        },
        {
          "id": "section-2",
          "title": "Bénéfices",
          "content": "Possibilité de déléguer certaines prestations sans nécessairement confier toute la gestion locative."
        },
        {
          "id": "section-3",
          "title": "Question",
          "content": "« Préféreriez-vous déléguer l'ensemble de la gestion ou uniquement certaines tâches ? »"
        },
        {
          "id": "prestations",
          "title": "Prestations",
          "content": "À préciser selon les besoins du propriétaire et les prestations réellement disponibles."
        },
        {
          "id": "formulation",
          "title": "Formulation commerciale",
          "content": "Choisissons ensemble les tâches que vous souhaitez déléguer, selon votre fonctionnement."
        }
      ],
      "status": "active",
      "position": 20,
      "updatedAt": "2026-10-26T00:00:00.000Z"
    },
    {
      "id": "argument-03",
      "title": "Proximité",
      "description": "Argument 03 — Proximité",
      "categoryId": "argumentaires",
      "subject": "",
      "content": "",
      "sections": [
        {
          "id": "section-1",
          "title": "Promesse",
          "content": "Un accompagnement humain et local en {{zone_zenvilla}}."
        },
        {
          "id": "section-2",
          "title": "Bénéfices",
          "content": "Un interlocuteur pour coordonner les prestations et suivre les besoins du logement."
        },
        {
          "id": "section-3",
          "title": "Question",
          "content": "« Lorsque vous n'êtes pas sur place, qui peut intervenir en cas de besoin ? »"
        },
        {
          "id": "prestations",
          "title": "Prestations",
          "content": "À préciser selon les besoins du propriétaire et les prestations réellement disponibles."
        },
        {
          "id": "formulation",
          "title": "Formulation commerciale",
          "content": "Nous vous proposons un relais local pour coordonner les interventions dans votre logement."
        }
      ],
      "status": "active",
      "position": 30,
      "updatedAt": "2026-10-26T00:00:00.000Z"
    },
    {
      "id": "argument-04",
      "title": "Organisation digitale",
      "description": "Argument 04 — Organisation digitale",
      "categoryId": "argumentaires",
      "subject": "",
      "content": "",
      "sections": [
        {
          "id": "section-1",
          "title": "Promesse",
          "content": "Simplifier le suivi des réservations et des prestations."
        },
        {
          "id": "section-2",
          "title": "Bénéfices",
          "content": "Une meilleure visibilité sur l'organisation du logement grâce aux outils {{entreprise}}."
        },
        {
          "id": "section-3",
          "title": "Question",
          "content": "« Comment suivez-vous actuellement vos réservations et les interventions dans votre logement ? »"
        },
        {
          "id": "prestations",
          "title": "Prestations",
          "content": "À préciser selon les besoins du propriétaire et les prestations réellement disponibles."
        },
        {
          "id": "formulation",
          "title": "Formulation commerciale",
          "content": "Voyons ensemble quels outils de suivi disponibles correspondent à votre organisation."
        },
        {
          "id": "verification",
          "title": "Avant utilisation",
          "content": "Vérifier les fonctionnalités effectivement opérationnelles avant de les présenter comme disponibles."
        }
      ],
      "status": "active",
      "position": 40,
      "updatedAt": "2026-10-26T00:00:00.000Z"
    },
    {
      "id": "objection-01",
      "title": "J'ai déjà quelqu'un.",
      "description": "Objection 01 — J'ai déjà quelqu'un.",
      "categoryId": "objections",
      "subject": "",
      "content": "Réponse :\n\n« Je comprends. Est-ce que vous êtes pleinement satisfait du service actuel ? Nous pouvons également intervenir ponctuellement sur certaines prestations si vous avez besoin d'un renfort. »",
      "sections": [],
      "status": "active",
      "position": 10,
      "updatedAt": "2026-10-26T00:00:00.000Z"
    },
    {
      "id": "objection-02",
      "title": "Je gère moi-même.",
      "description": "Objection 02 — Je gère moi-même.",
      "categoryId": "objections",
      "subject": "",
      "content": "Réponse :\n\n« C'est souvent une bonne solution lorsqu'on est disponible sur place. Est-ce que les changements de voyageurs, le ménage ou les imprévus vous prennent beaucoup de temps pendant la saison ? »",
      "sections": [],
      "status": "active",
      "position": 20,
      "updatedAt": "2026-10-26T00:00:00.000Z"
    },
    {
      "id": "objection-03",
      "title": "Combien ça coûte ?",
      "description": "Objection 03 — Combien ça coûte ?",
      "categoryId": "objections",
      "subject": "",
      "content": "Réponse :\n\n« Nos tarifs dépendent des prestations souhaitées, des caractéristiques du logement et de la fréquence des interventions. Je préfère comprendre votre organisation avant de vous proposer un devis adapté. »",
      "sections": [],
      "status": "active",
      "position": 30,
      "updatedAt": "2026-10-26T00:00:00.000Z"
    },
    {
      "id": "objection-04",
      "title": "Je ne veux pas perdre le contrôle.",
      "description": "Objection 04 — Je ne veux pas perdre le contrôle.",
      "categoryId": "objections",
      "subject": "",
      "content": "Réponse :\n\n« C'est tout à fait compréhensible. L'objectif n'est pas de vous retirer le contrôle, mais de définir ensemble les tâches que vous souhaitez déléguer et les informations que vous voulez continuer à suivre. »",
      "sections": [],
      "status": "active",
      "position": 40,
      "updatedAt": "2026-10-26T00:00:00.000Z"
    },
    {
      "id": "objection-05",
      "title": "Je ne suis pas intéressé.",
      "description": "Objection 05 — Je ne suis pas intéressé.",
      "categoryId": "objections",
      "subject": "",
      "content": "Réponse :\n\n« Je comprends, merci de m'avoir répondu. Je ne vous solliciterai pas davantage. Bonne journée. »",
      "sections": [
        {
          "id": "opposition",
          "title": "Consigne interne",
          "content": "Enregistrer le refus dans le CRM et bloquer les nouvelles sollicitations commerciales."
        }
      ],
      "status": "active",
      "position": 50,
      "updatedAt": "2026-10-26T00:00:00.000Z"
    },
    {
      "id": "objection-06",
      "title": "Envoyez-moi une présentation.",
      "description": "Objection 06 — Envoyez-moi une présentation.",
      "categoryId": "objections",
      "subject": "",
      "content": "Réponse :\n\n« Bien sûr. Pour vous envoyer uniquement les informations pertinentes, est-ce que vous recherchez plutôt une aide ponctuelle ou une gestion plus complète ? »",
      "sections": [],
      "status": "active",
      "position": 60,
      "updatedAt": "2026-10-26T00:00:00.000Z"
    }
  ],
  "categories": [
    {
      "id": "emails",
      "name": "Emails",
      "position": 0
    },
    {
      "id": "appels",
      "name": "Appels",
      "position": 10
    },
    {
      "id": "whatsapp",
      "name": "WhatsApp",
      "position": 20
    },
    {
      "id": "argumentaires",
      "name": "Argumentaires",
      "position": 30
    },
    {
      "id": "objections",
      "name": "Objections",
      "position": 40
    }
  ],
  "settings": {
    "brand": "Zen Villa",
    "website": "https://www.zen-villa.fr",
    "email": "contact@zen-villa.fr",
    "phone": "+33 6 86 40 13 16",
    "zone": "Corse-du-Sud",
    "objective": "rendez-vous de 10 à 15 minutes",
    "pricing": "devis personnalisé"
  },
  "variables": [
    {
      "id": "prenom",
      "label": "Prenom",
      "defaultValue": ""
    },
    {
      "id": "nom",
      "label": "Nom",
      "defaultValue": ""
    },
    {
      "id": "civilite",
      "label": "Civilite",
      "defaultValue": ""
    },
    {
      "id": "nom_villa",
      "label": "Nom villa",
      "defaultValue": ""
    },
    {
      "id": "zone",
      "label": "Zone",
      "defaultValue": ""
    },
    {
      "id": "telephone",
      "label": "Telephone",
      "defaultValue": ""
    },
    {
      "id": "email",
      "label": "Email",
      "defaultValue": ""
    },
    {
      "id": "services",
      "label": "Services",
      "defaultValue": ""
    },
    {
      "id": "besoins",
      "label": "Besoins",
      "defaultValue": ""
    },
    {
      "id": "organisation_actuelle",
      "label": "Organisation actuelle",
      "defaultValue": ""
    },
    {
      "id": "date_rdv",
      "label": "Date rdv",
      "defaultValue": ""
    },
    {
      "id": "heure_rdv",
      "label": "Heure rdv",
      "defaultValue": ""
    },
    {
      "id": "creneau_1",
      "label": "Creneau 1",
      "defaultValue": ""
    },
    {
      "id": "creneau_2",
      "label": "Creneau 2",
      "defaultValue": ""
    },
    {
      "id": "prestations_proposees",
      "label": "Prestations proposees",
      "defaultValue": ""
    }
  ],
  "versions": []
};
}
