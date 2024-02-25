import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import {
  Modal,
  TextInput,
  Group as MantineGroup,
  Textarea,
  Table,
  ScrollArea,
  Button,
} from "@mantine/core";
import classes from "~/style/Groups.module.css";
import cx from "clsx";
import pb from "../lib/pocketbase";

interface Group {
  id: string;
  name: string;
  users: string[];
  owner: string;
}

interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
}

interface Users {
  [key: string]: User;
}

export default function EventDetails() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<Users>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newGroupName, setNewGroupName] = useState<string>("");
  const [newGroupEmails, setNewGroupEmails] = useState<string>("");
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const handleUpdateGroup = (group: Group) => {
    setEditingGroup(group);
    setNewGroupName(group.name);
    // Assuming you store the user emails in the group or can fetch them based on user IDs
    const userEmails = group.users
      .map((userId) => users[userId]?.email)
      .join(", ");
    setNewGroupEmails(userEmails);
    setIsEditModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Use editingGroup to decide if creating or updating
    if (editingGroup) {
      // Logic to update the group using `pb.collection("groups").update(...)`
      // You need to implement the logic to convert emails back to userIds if necessary
    } else {
      // Existing logic to create a new group
      handleCreateGroup();
    }
  };

  const handleCreateGroup = async () => {
    const emailArray = newGroupEmails.split(",").map((email) => email.trim());
    const userIds: string[] = [];

    for (const email of emailArray) {
      try {
        // Adjust the filter to properly query for the email address
        const filter = `email = '${email}'`;
        // Use the corrected filter in your query
        const userResponse = await pb
          .collection("users")
          .getList(1, 50, { filter });
        if (userResponse.items.length > 0) {
          userIds.push(userResponse.items[0].id);
        } else {
          console.warn(`No user found for email: ${email}`);
        }
      } catch (error: any) {
        console.error("Error fetching user by email:", error);
      }
    }

    if (userIds.length > 0) {
      const newGroup = {
        name: newGroupName,
        users: userIds,
        owner: pb.authStore.model?.id,
      };

      try {
        const saveResponse = await pb.collection("groups").create(newGroup);
        console.log("Group created successfully:", saveResponse);
        setIsModalOpen(false);
        setNewGroupName("");
        setNewGroupEmails("");
        const updatedGroups = [...groups, saveResponse];
        setGroups(updatedGroups);
      } catch (error: any) {
        console.error("Error creating group:", error);
      }
    } else {
      console.error("No valid user IDs found for the given emails");
    }
  };

  useEffect(() => {
    const fetchGroups = async () => {
      const url = `http://127.0.0.1:8090/api/collections/groups/records/`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch groups");
        }
        const data: { items: Group[] } = await response.json();

        const ownedGroups = data.items.filter(
          (group) => group.owner === (pb.authStore.model?.id ?? "")
        );
        setGroups(ownedGroups);
        const userIds = [
          ...new Set(ownedGroups.flatMap((group) => group.users)),
        ];
        Promise.all(userIds.map(fetchUserDetails)).then(() =>
          setLoading(false)
        );
      } catch (error) {
        console.error("Error fetching groups:", error);
        setError("Error fetching groups");
        setLoading(false);
      }
    };

    const fetchUserDetails = async (userId: string) => {
      const url = `http://127.0.0.1:8090/api/collections/users/records/${userId}`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch user details");
        }
        const userDetails: User = await response.json();
        setUsers((prev) => ({ ...prev, [userId]: userDetails }));
      } catch (error) {
        console.error(`Error fetching details for user ${userId}:`, error);
        setError(`Error fetching details for user ${userId}`);
      }
    };

    fetchGroups();
  }, []);

  const handleDeleteGroup = async (groupId: string) => {
    try {
      // Assuming 'groups' is the name of your collection in PocketBase
      await pb.collection("groups").delete(groupId);
      console.log(`Group with ID: ${groupId} deleted successfully`);

      // Remove the deleted group from the state
      const updatedGroups = groups.filter((group) => group.id !== groupId);
      setGroups(updatedGroups);
    } catch (error: any) {
      console.error("Error deleting group:", error);
      // Optionally, handle errors (e.g., show an error message)
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (groups.length === 0) {
    return (
      <div>
        Nemáte žádné skupiny.
        <Button onClick={() => setIsModalOpen(true)}>Vytvořit skupinu</Button>
      </div>
    );
  }

  return (
    <>
      <div className={classes.groups}>
        {groups.map((group) => (
          <div key={group.id} className={classes.group}>
            <h1>{group.name}</h1>
            <Table style={{ minWidth: 700 }} aria-label="User list">
              <thead
                className={cx(classes.header, { [classes.scrolled]: false })}
              >
                <tr>
                  <th>Jméno</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {group.users.map((userId) => (
                  <tr key={userId}>
                    <td>
                      {users[userId]?.name} {users[userId]?.surname}
                    </td>
                    <td>{users[userId]?.email}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <Button color="red" onClick={() => handleDeleteGroup(group.id)}>
              Smazat skupinu
            </Button>
            <Button onClick={() => handleUpdateGroup(group)}>
              Upravit skupinu
            </Button>
          </div>
        ))}
      </div>
      <Button onClick={() => setIsModalOpen(true)}>Vytvořit skupinu</Button>

      <Modal
        opened={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingGroup(null);
        }}
        title={editingGroup ? "Upravit skupinu" : "Vytvořit novou skupinu"}
      >
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Název skupiny"
            placeholder="Zadejte název skupiny"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            required
          />
          <Textarea
            label="Emaily členů"
            placeholder="Zadejte emaily, oddělené čárkou"
            value={newGroupEmails}
            onChange={(e) => setNewGroupEmails(e.target.value)}
            required
          />
          <MantineGroup mt="md">
            <Button type="submit">Vytvořit</Button>
          </MantineGroup>
        </form>
      </Modal>
    </>
  );
}
