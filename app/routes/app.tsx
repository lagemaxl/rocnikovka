import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import classes from "~/style/NavbarSimple.module.css";
import pb from "../lib/pocketbase";
import { Outlet } from "@remix-run/react";
import { useDisclosure } from "@mantine/hooks";
import { Burger } from "@mantine/core";
import {
  Menu,
  Group,
  Text,
  ActionIcon,
  rem,
  Avatar as MantineAvatar,
} from "@mantine/core";
import {
  IconLogout,
  IconSettings,
  IconUsersGroup,
  IconDots,
  IconBellRinging,
  IconHome,
  IconUserCircle,
  IconHistory,
} from "@tabler/icons-react";

interface LinkData {
  link: string;
  label: string;
  icon: typeof IconHome | typeof IconBellRinging | typeof IconSettings;
}

interface UserData {
  id?: string;
  avatar?: string;
  name?: string;
  surname?: string;
  username?: string;
}

const data: LinkData[] = [
  { link: "/app/home", label: "Domů", icon: IconHome },
  { link: "/app/notifications", label: "Oznámení", icon: IconBellRinging },
  { link: "/app/settings", label: "Nastavení", icon: IconSettings },
  { link: "/app/groups", label: "Skupiny", icon: IconUsersGroup },
  { link: "/app/profile", label: "Můj profil", icon: IconUserCircle },
  { link: "/app/history", label: "Historie", icon: IconHistory },
];

export default function NavbarSimple() {
  const [active, setActive] = useState<string>("Domů");
  const navigate = useNavigate();
  const [dataUser, setDataUser] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://rocnikovka2.pockethost.io/api/collections/users/records/${pb?.authStore?.model?.id}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const jsonData: UserData = await response.json();
        setDataUser(jsonData);
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
    };
    fetchData();
  }, [pb.authStore.isValid]);

  const avatarURL = `https://rocnikovka2.pockethost.io/api/files/_pb_users_auth_/${dataUser?.id}/${dataUser?.avatar}`;

  useEffect(() => {
    if (!pb.authStore.isValid) {
      navigate("/login");
    }
  }, [navigate, pb.authStore.isValid]);

  const [opened, { toggle }] = useDisclosure();

  const links = data.map((item: LinkData) => (
    <a
      className={`${classes.link} ${
        active === item.label ? classes.activeLink : ""
      }`}
      onClick={(event) => {
        event.preventDefault();
        setActive(item.label);
        navigate(item.link);
        toggle();
      }}
      key={item.label}
    >
      <item.icon className={classes.linkIcon} stroke={2} />
      <span>{item.label}</span>
    </a>
  ));


  return (
    dataUser && (
      <div className={classes.container}>
        <nav className={`${classes.navbar} ${opened ? classes.navmobile : ""}`}>
          <div className={classes.navbarMain}>
            {links}
            <button
              className={classes.addeventbutton}
              onClick={() => {
                setActive("newevent");
                navigate("/app/new");
              }}
            >
              Vytvořit událost
            </button>
          </div>

          <div className={classes.footer}>
            <Group gap="sm" className={classes.footerGroup}>
              <Group>
                <MantineAvatar size={50} src={avatarURL} radius={30} />
                <Text fontSize="medium" fontWeight={500}>
                  {dataUser.name} {dataUser.surname} <br />@{dataUser.username}
                </Text>
              </Group>
              <UserMenu />
            </Group>
          </div>
        </nav>
        <div className={classes.burger}>
          <Burger opened={opened} onClick={toggle} />
        </div>
        <div className={`${classes.appcontainer} ${opened ? classes.nodisplay : ""}`}>
          <Outlet />
        </div>
      </div>
    )
  );
}

interface UserMenuProps {
  dataUser: UserData;
  avatarURL: string;
}

export function UserMenu() {
  const navigate = useNavigate();
  return (
    <Group justify="center">
      <Menu
        withArrow
        width={300}
        position="bottom"
        transitionProps={{ transition: "pop" }}
        withinPortal
      >
        <Menu.Target>
          <ActionIcon variant="default">
            <IconDots
              style={{ width: rem(16), height: rem(16) }}
              stroke={1.5}
            />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Nastavení</Menu.Label>
          <Menu.Item
            leftSection={
              <IconSettings
                style={{ width: rem(16), height: rem(16) }}
                stroke={1.5}
              />
            }
          >
            Nastavení účtu
          </Menu.Item>
          <Menu.Item
            leftSection={
              <IconLogout
                style={{ width: rem(16), height: rem(16) }}
                stroke={1.5}
              />
            }
            onClick={() => {
              navigate("/login");
              pb.authStore.clear();
            }}
          >
            Odhlásit se
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
