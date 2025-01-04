import React from 'react';
import Post from './Post';
import styles from '../styles/OrganizationView.module.css';

const PostList = ({ posts, organization, staff, isAdmin, setPosts }) => (
  <div className={styles.posts}>
    {posts.map((post) => (
      <Post
        key={post.id}
        post={post}
        organization={organization}
        organizationSettings={organization.settings}
        authors={staff.filter((member) => post.members.includes(member.auth_id))}
        isAdmin={isAdmin}
        posts={posts}
        setPosts={setPosts}
      />
    ))}
  </div>
);

export default PostList; 