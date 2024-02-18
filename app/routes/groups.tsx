import React, { useState, useEffect } from "react";
import classes from "~/style/Groups.module.css";
import cx from 'clsx';
import { Table, ScrollArea } from '@mantine/core';
import pb from "../lib/pocketbase";


interface Group {
  id: string;
  name: string;
  users: string[];
  owner: string; // Property to include the ID of the group owner
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

  useEffect(() => {
    const fetchGroups = async () => {
      const url = `http://127.0.0.1:8090/api/collections/groups/records/`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch groups');
        }
        const data: { items: Group[] } = await response.json();
        
        const ownedGroups = data.items.filter(group => group.owner === (pb.authStore.model?.id ?? ''));
        setGroups(ownedGroups);
        const userIds = [...new Set(ownedGroups.flatMap(group => group.users))];
        Promise.all(userIds.map(fetchUserDetails)).then(() => setLoading(false));
      } catch (error) {
        console.error('Error fetching groups:', error);
        setError('Error fetching groups');
        setLoading(false);
      }
    };

    const fetchUserDetails = async (userId: string) => {
      const url = `http://127.0.0.1:8090/api/collections/users/records/${userId}`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch user details');
        }
        const userDetails: User = await response.json();
        setUsers(prev => ({ ...prev, [userId]: userDetails }));
      } catch (error) {
        console.error(`Error fetching details for user ${userId}:`, error);
        setError(`Error fetching details for user ${userId}`);
      }
    };

    fetchGroups();
  }, []);

  const [scrolled, setScrolled] = useState(false);

  const rows = Object.values(users).map((user) => (
    <tr key={user.id}>
      <td>{user.name} {user.surname}</td>
      <td>{user.email}</td>
    </tr>
  ));

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <ScrollArea style={{ height: 300 }} onScrollPositionChange={({ y }) => setScrolled(y !== 0)} aria-label="User details">
      <Table style={{ minWidth: 700 }} aria-label="User list">
        <thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
          <tr>
            <th>Name</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}
