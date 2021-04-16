
<script>
    import {
        Button,
        ButtonSet,
        Tile,
        FluidForm,
        InlineNotification,
        TextInput,
        PasswordInput,
    } from "carbon-components-svelte";

    let invalid_login = false
  </script>

<svelte:head><link rel="stylesheet" href="https://unpkg.com/carbon-components-svelte@0.30.0/css/g10.css" /></svelte:head>

<div style="padding: 2rem;">
    <Tile>
        <FluidForm>
            {#if invalid_login}
                <InlineNotification
                    lowContrast
                    subtitle="Invalid login or password."
                    on:close={() => invalid_login = false}
                />
            {/if}
            <TextInput
                required
                labelText="User name"
                placeholder="Enter user name..."
                
            />
            <PasswordInput
                required
                type="password"
                labelText="Password"
                placeholder="Enter password..."                
                invalidText="Incorrect user name or password."
            />
        </FluidForm>

        <ButtonSet>
            <Button kind="primary" on:click={() => invalid_login = true}>
                Log In
            </Button>
        </ButtonSet>
    </Tile>
</div>

