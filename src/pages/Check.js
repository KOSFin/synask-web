import React, { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import l from './Loader.module.css';

const supabaseClient = createClient('https://cnicyffiqvdhgyzkogtl.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuaWN5ZmZpcXZkaGd5emtvZ3RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDc3NDM2NzcsImV4cCI6MjAyMzMxOTY3N30.bZoapdV-TJiq42uJaOPGBfPz91ULReQ1_ahXpUHNaJ8');

const AccountSetupPage = () => {
  useEffect(() => {
    const setupAccount = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser();

      if (user) {
        // Public information
        let { data: publicData } = await supabaseClient
          .from('users_public_information')
          .select('*')
          .eq('auth_id', user.id);

        const birthdayParts = user.user_metadata.birthday.split('-');
        const formattedBirthday = `${birthdayParts[0]}.${birthdayParts[1]}.${birthdayParts[2]}`;
        const genderValue = parseInt(user.user_metadata.gender);

        if (!publicData.length) {
          await supabaseClient
            .from('users_public_information')
            .upsert(
              {
                auth_id: user.id,
                username: user.user_metadata.nickname,
                first_name: user.user_metadata.firstName,
                last_name: user.user_metadata.lastName,
                gender: genderValue,
                birthday: user.user_metadata.birthday,
                created_at: new Date(),
              },
              { onConflict: ['auth_id'] }
            );
        }

        // Private information
        let { data: privateData } = await supabaseClient
          .from('users_private_information')
          .select('*')
          .eq('auth_id', user.id);

        if (!privateData.length) {
          await supabaseClient
            .from('users_private_information')
            .upsert(
              {
                auth_id: user.id,
                email: user.email,
                phone: user.user_metadata.phone,
              },
              { onConflict: ['auth_id'] }
          );
        }

        window.location.href = '/';
      } else {
        window.location.href = '/login.html';
      }
    };

    setupAccount();
  }, []);

  return (
    <div className={l.spinner}>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};

export default AccountSetupPage;