import React, { useState, useEffect } from "react";
import classes from "~/style/Groups.module.css";
import cx from 'clsx';
import { Table, ScrollArea } from '@mantine/core';

interface Group {
  id: string;
  name: string;
  users: string[];
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

  useEffect(() => {
    const fetchGroups = async () => {
      const url = `http://127.0.0.1:8090/api/collections/groups/records/`;
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch groups');
        }
        const data: { items: Group[] } = await response.json();
        setGroups(data.items);
        const userIds = [...new Set(data.items.flatMap(group => group.users))];
        userIds.forEach(fetchUserDetails);
      } catch (error) {
        console.error('Error fetching groups:', error);
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

  return (
    <ScrollArea style={{ height: 300 }} onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
      <Table style={{ minWidth: 700 }}>
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
