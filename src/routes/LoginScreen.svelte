
<script>
    import {
        Button,
        ButtonSet,
        Tile,
        FluidForm,
        TextInput,
        PasswordInput,
    } from "carbon-components-svelte";
  </script>

<svelte:head><link rel="stylesheet" href="https://unpkg.com/carbon-components-svelte@0.30.0/css/g10.css" /></svelte:head>

<div style="padding: 2rem;">
    <Tile>
        <FluidForm>
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
            />
        </FluidForm>

        <ButtonSet>
            <Button kind="primary">
                Login
            </Button>
        </ButtonSet>
    </Tile>
</div>

