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


useEffect(() => {
  setNewGroupEmails("");
  setNewGroupName("");
}, [isModalOpen]);


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
        const updatedGroups = [...groups, saveResponse as unknown as Group]; // Explicitly cast saveResponse as Group
        setGroups(updatedGroups);
      } catch (error: any) {
        console.error("Error creating group:", error);
      }
    } else {
      console.error("No valid user IDs found for the given emails");
    }
  };


  const handleOpenEditGroup = (group: Group) => {
    setEditingGroup(group);
    setIsEditModalOpen(true);
    setNewGroupName(group.name);
    // Assuming you store group user emails in state, you need to convert user IDs back to emails
    // This might require fetching users or having a users' email map available
    const groupEmails = group.users.map(userId => users[userId]?.email).join(", ");
    setNewGroupEmails(groupEmails);
  };

  
  const handleUpdateGroup = async () => {
    if (!editingGroup) return; // Ensure there is a group being edited
  
    const emailArray = newGroupEmails.split(",").map(email => email.trim());
    // Transform emails back to userIds, similar to handleCreateGroup
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

  
    const updatedGroup = {
      ...editingGroup,
      name: newGroupName,
      users: userIds,
    };
  
    try {
      // Assuming you have an API or method to update a group
      await pb.collection("groups").update(editingGroup.id, updatedGroup);
      console.log("Group updated successfully");
  
      // Update groups state with the updated group details
      setGroups(groups.map(group => group.id === editingGroup.id ? updatedGroup : group));
      setIsEditModalOpen(false); // Close the modal
      // Reset editing state
      setEditingGroup(null);
      setNewGroupName("");
      setNewGroupEmails("");
    } catch (error) {
      console.error("Error updating group:", error);
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

  return (
    <>
      {groups.length === 0 && (
        <div>
          Nemáte žádné skupiny.
        </div>
      )}
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
            <Button onClick={() => handleOpenEditGroup(group)}>Upravit skupinu</Button>

          </div>
        ))}
      </div>
      <Button onClick={() => { setNewGroupName(""); setNewGroupEmails(""); setIsModalOpen(true);}}>Vytvořit skupinu</Button>
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Vytvořit novou skupinu"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateGroup();
          }}
        >
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

      <Modal
        opened={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Upravit skupinu"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateGroup();
          }}
        >
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
            <Button type="submit">Uložit</Button>
          </MantineGroup>
        </form>
      </Modal>
    </>
  );
}
