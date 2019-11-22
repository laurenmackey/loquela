CREATE TABLE users (
    id serial PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE user_profiles (
    id serial PRIMARY KEY,
    user_id integer NOT NULL,
    language VARCHAR(255),
    topic VARCHAR(255),
    difficulty VARCHAR(255),
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_profiles_user_id_fkey FOREIGN KEY (user_id)
      REFERENCES users (id) MATCH SIMPLE
      ON UPDATE RESTRICT ON DELETE CASCADE
);


CREATE TABLE prompts (
    id serial PRIMARY KEY,
    name VARCHAR(255),
    text VARCHAR(255),
    topic VARCHAR(255),
    language VARCHAR(255),
    entities VARCHAR(255),
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE results (
    id serial PRIMARY KEY,
    prompt_id integer NOT NULL,
    attempted integer NOT NULL default 0,
    correct integer NOT NULL,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT results_prompt_id_fkey FOREIGN KEY (prompt_id)
      REFERENCES prompts (id) MATCH SIMPLE
      ON UPDATE RESTRICT ON DELETE CASCADE
);

CREATE TABLE prompt_activities (
    id serial PRIMARY KEY,
    user_id integer NOT NULL,
    prompt_id integer NOT NULL,
    grade integer,
    letter_grade VARCHAR(255),
    feedback_text text,
    text text,
    created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT prompt_activities_user_id_fk FOREIGN KEY (user_id)
      REFERENCES users (id) MATCH SIMPLE
      ON UPDATE RESTRICT ON DELETE CASCADE,
     CONSTRAINT prompt_activities_prompt_id_fk FOREIGN KEY (prompt_id)
      REFERENCES prompts (id) MATCH SIMPLE
      ON UPDATE RESTRICT ON DELETE CASCADE
);
