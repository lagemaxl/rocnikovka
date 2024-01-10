import React, { useState } from "react";
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Progress,
  Box,
  Center,
  Group,
} from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";
import classes from "~/style/AuthenticationImage.module.css";
import pb from "../lib/pocketbase";
import { IconCheck, IconX } from "@tabler/icons-react";

export function links() {
  return [{ rel: "stylesheet", href: classes }];
}

interface TouchState {
  email: boolean;
  password: boolean;
  name: boolean;
  surname: boolean;
  username: boolean;
}

const requirements = [
  { re: /[0-9]/, label: "Číslo" },
  { re: /[a-z]/, label: "Malé písmenko" },
  { re: /[A-Z]/, label: "Velké písmenko" },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: "Speciální znak" },
];

function getStrength(password: string) {
  let multiplier = password.length > 5 ? 0 : 1;

  requirements.forEach((requirement) => {
    if (!requirement.re.test(password)) {
      multiplier += 1;
    }
  });

  return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 0);
}

interface FormData {
  username: string;
  email: string;
  emailVisibility: boolean;
  password: string;
  passwordConfirm: string;
  name: string;
  surname: string;
  premium: boolean;
}

function checkPasswordRequirements(password: string) {
  return requirements.every((requirement) => requirement.re.test(password));
}

interface PasswordRequirementProps {
  meets: boolean;
  label: string;
}

function PasswordRequirement({ meets, label }: PasswordRequirementProps) {
  return (
    <Text component="div" color={meets ? "teal" : "red"} mt={5} size="sm">
      <Center inline>
        {meets ? (
          <IconCheck size="0.9rem" stroke={1.5} />
        ) : (
          <IconX size="0.9rem" stroke={1.5} />
        )}
        <Box ml={7}>{label}</Box>
      </Center>
    </Text>
  );
}

const AuthenticationImage: React.FC = () => {
  const [error, setError] = useState<string>("");
  const [isTouched, setIsTouched] = useState<TouchState>({
    email: false,
    password: false,
    name: false,
    surname: false,
    username: false,
  });

  const navigate = useNavigate();

  const initialFormData: FormData = {
    username: "",
    email: "",
    emailVisibility: true,
    password: "",
    passwordConfirm: "",
    name: "",
    surname: "",
    premium: false,
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleRegisterClick = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();

    setIsTouched({
      email: true,
      password: true,
      name: true,
      surname: true,
      username: true,
    });

    if (
      !formData.email ||
      !formData.password ||
      !formData.name ||
      !formData.surname ||
      !formData.username
    ) {
      setError("Prosím vyplňte všechna pole");
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError("Prosím zadejte platný email");
      return;
    }

    if (!checkPasswordRequirements(formData.password)) {
      setError("Heslo nesplňuje požadavky");
      return;
    }

    formData.passwordConfirm = formData.password;

    try {
      console.log("Registering user", formData);
      const record = await pb.collection("users").create(formData);

      console.log("Registration successful");
      navigate("/login");
    } catch (error) {
      console.error("Registration failed", error);
    }
  };

  const isValidEmail = (email: string): boolean => {
    return /\S+@\S+\.\S+/.test(email);
  };

  /*
  const handleLogin = async () => {

    try {
      const authData = await pb
        .collection("users")
        .authWithPassword(formData.email, formData.password);
      console.log("Authentication Successful", authData);
      navigate("/app");
    } catch (err) {
      if (err instanceof Error) {
        setError("Nepodařilo se zaregistrovat, zkuste to prosím znovu");
      } else {
        setError("Nastala chyba, zkuste to prosím znovu později");
      }
    }
  };

  */

  const emailClasses = `${classes.input} ${
    isTouched.email && (!formData.email || !isValidEmail(formData.email))
      ? classes.error
      : ""
  }`;
  const passwordClasses = `${classes.input} ${
    isTouched.password && !formData.password ? classes.error2 : ""
  }`;
  const nameClasses = `${classes.input} ${
    isTouched.name && !formData.name ? classes.error : ""
  }`;
  const surnameClasses = `${classes.input} ${
    isTouched.surname && !formData.surname ? classes.error : ""
  }`;
  const usernameClasses = `${classes.input} ${
    isTouched.username && !formData.username ? classes.error : ""
  }`;

  const strength = getStrength(formData.password);
  const checks = requirements.map((requirement, index) => (
    <PasswordRequirement
      key={index}
      label={requirement.label}
      meets={requirement.re.test(formData.password)}
    />
  ));
  const bars = Array(4)
    .fill(0)
    .map((_, index) => (
      <Progress
        styles={{ section: { transitionDuration: "0ms" } }}
        value={
          formData.password.length > 0 && index === 0
            ? 100
            : strength >= ((index + 1) / 4) * 100
            ? 100
            : 0
        }
        color={strength > 80 ? "teal" : strength > 50 ? "yellow" : "red"}
        key={index}
        size={4}
      />
    ));

  return (
    <div className={classes.wrapper}>
      <Paper className={classes.form} radius={0} p={30}>
        <Title order={2} className={classes.title} ta="center" mt="md" mb={50}>
          Zaregistrujte se
        </Title>

        <TextInput
          label="Jméno:"
          placeholder="Jméno"
          size="md"
          mt="md"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={nameClasses}
        />

        <TextInput
          label="Přijmení:"
          placeholder="Přijmení"
          size="md"
          mt="md"
          name="surname"
          value={formData.surname}
          onChange={handleChange}
          className={surnameClasses}
        />

        <TextInput
          label="Uživatelské jméno:"
          placeholder="Uživatelské jméno"
          size="md"
          mt="md"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className={usernameClasses}
        />

        <TextInput
          label="Email:"
          placeholder="Váš email"
          mt="md"
          size="md"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={emailClasses}
        />

        <div>
          <PasswordInput
          label="Heslo:"
          placeholder="Vaše heslo"
          mt="md"
          size="md"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className={passwordClasses}
        />

          <Group gap={5} grow mt="xs" mb="md">
            {bars}
          </Group>

          <PasswordRequirement
            label="Minimálně 5 znaků"
            meets={formData.password.length > 4}
          />
          {checks}
        </div>

        <Button fullWidth mt="xl" size="md" onClick={handleRegisterClick}>
          Zaregistrovat se
        </Button>

        {error && (
          <Text color="red" mt="md">
            {error}
          </Text>
        )}

        <Text ta="center" mt="md">
          Již máte účet? <Link to="/login">Přihlásit se</Link>
        </Text>
      </Paper>
    </div>
  );
};

export default AuthenticationImage;
