import { Image, Container, Title, Button, Group, Text, List, ThemeIcon, rem } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import classes from '~/style/HeroBullets.module.css';
import classesGroup from '~/style/StatsGroup.module.css';
import classesCard from '~/style/FeaturesCards.module.css';
import {
  Badge,
  Card,
  SimpleGrid,
  useMantineTheme,
} from '@mantine/core';
import { IconGauge, IconUser, IconCookie } from '@tabler/icons-react';
import { ActionIcon } from '@mantine/core';
import { IconBrandTwitter, IconBrandYoutube, IconBrandInstagram } from '@tabler/icons-react';
import { useNavigate } from "react-router-dom";
import { useState } from 'react';

const data = [
  {
    title: 'Návštěvnost',
    stats: '456,133',
    description: '24% více než ve stejném měsíci loňského roku, 33% více než před dvěma lety',
  },
  {
    title: 'Počet aktivních uživatelů',
    stats: '2,175',
    description: '13% méně ve srovnání s minulým měsícem, zvýšení zapojení nových uživatelů o 6%',
  },
  {
    title: 'Uskutečněných událostí',
    stats: '3,994',
    description: 'V tomto měsíci bylo pomocí naší aplikace uspořádáno 3 994 událostí',
  },
];

const mockdata = [
  {
    title: 'Extrémní výkon',
    description:
      'Aplikace používá nejnovější technologie pro maximalizování rachlosti aplikace.',
    icon: IconGauge,
  },
  {
    title: 'Zaměřeno na soukromí',
    description:
      'Všechny data jsou šifrovány a ukládány na našich vlastních serverech.',
    icon: IconUser,
  },
  {
    title: 'Bez třetích stran',
    description:
      'Nikdy neprodáváme vaše data třetím stranám, vše je u nás v bezpečí.',
    icon: IconCookie,
  },
];

function StatsGroup() {
  const stats = data.map((stat) => (
    <div key={stat.title} className={classesGroup.stat}>
      <Text className={classesGroup.count}>{stat.stats}</Text>
      <Text className={classesGroup.title}>{stat.title}</Text>
      <Text className={classesGroup.description}>{stat.description}</Text>
    </div>
  ));
  return <div className={classesGroup.root}>{stats}</div>;
}

function HeroBullets() {
  const [pagePath, setPagePath] = useState<boolean>(true);
  const navigate = useNavigate();

  const Register = (): void => {
    if (pagePath) {
      navigate("/register");
    }
  }

  const Login = (): void => {
    if (pagePath) {
      navigate("/login");
    }
  }

  return (
    <Container size="md">
      <br />
      <br />
      <br />
      <div className={classes.inner}>
        <div className={classes.content}>
          <Title className={classes.title}>
            Nejlepší platforma pro <span className={classes.highlight}>plánování událostí</span> zcela zdarma!
          </Title>
          <Text c="dimmed" mt="md">
            Plánujete událost ale nevíte jak na to? Máme pro vás řešení! Vytvořte si účet a začněte plánovat události zdarma! 
          </Text>
          
          <List
            mt={30}
            spacing="sm"
            size="sm"
            icon={
              <ThemeIcon size={20} radius="xl">
                <IconCheck style={{ width: rem(12), height: rem(12) }} stroke={1.5} />
              </ThemeIcon>
            }
          >
            <List.Item>
              <b>Jednoduše</b> vytvářejte události pro menší i větší skupiny.
            </List.Item>
            <List.Item>
              <b>Zdarma</b> bez skrytých poplatků a omezení.
            </List.Item>
            <List.Item>
              <b>Spoustu funkcí navíc</b> pro maximální pohodlí a efektivitu.
            </List.Item> 
          </List>

          <Group mt={30}>
            <Button radius="xl" size="md" onClick={() => Register()}  className={classes.control}>
              Zaregistrujte se zdarma
            </Button>
            <Button variant="default" onClick={() => Login()} radius="xl" size="md" className={classes.control}>
              Přihlašte se
            </Button>
          </Group>
        </div>
        <Image src="https://ui.mantine.dev/_next/static/media/image.9a65bd94.svg" className={classes.image} />
      </div>
      <br />
      <br />
      <br />   
      <br />
      <StatsGroup />
      <br />
      <br />
      <br /> 
      <br />
      <FeaturesCards />
      <FooterSocial/>
    </Container>
  );
}


function FeaturesCards() {
  const theme = useMantineTheme();
  const features = mockdata.map((feature) => (
    <Card key={feature.title} shadow="md" radius="md" className={classesCard.card} padding="xl">
      <feature.icon
        style={{ width: rem(50), height: rem(50) }}
        stroke={2}
        color={theme.colors.blue[6]}
      />
      <Text fz="lg" fw={500} className={classesCard.cardTitle} mt="md">
        {feature.title}
      </Text>
      <Text fz="sm" c="dimmed" mt="sm">
        {feature.description}
      </Text>
    </Card>
  ));

  return (
    <Container size="lg" py="xl">
      <Group justify="center">
        <Badge variant="filled" size="lg">
          záleží nám na vás
        </Badge>
      </Group>

      <Title order={2} className={classesCard.title} ta="center" mt="sm">
      Bezpečnost a soukromí na prvním místě
      </Title>

      <Text c="dimmed" className={classesCard.description} ta="center" mt="md">
        Všechny naše komponenty a háčky jsou navrženy s ohledem na bezpečnost a soukromí, všechny data jsou šifrovány a ukládány na našich vlastních serverech.
      </Text>

      <SimpleGrid cols={{ base: 1, md: 3 }} spacing="xl" mt={50}>
        {features}
      </SimpleGrid>
    </Container>
  );
}

function FooterSocial() {
  return (
    <div className={classes.footer}>
      <Container className={classes.inner}>

        <Group gap={0} className={classes.links} justify="flex-end" wrap="nowrap">
          <ActionIcon size="lg" color="gray" variant="subtle">
            <IconBrandTwitter style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
          </ActionIcon>
          <ActionIcon size="lg" color="gray" variant="subtle">
            <IconBrandYoutube style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
          </ActionIcon>
          <ActionIcon size="lg" color="gray" variant="subtle">
            <IconBrandInstagram style={{ width: rem(18), height: rem(18) }} stroke={1.5} />
          </ActionIcon>
        </Group>
      </Container>
    </div>
  );
}




export default HeroBullets;