# EXTRACT RDS DATA FROM SNAPSHOTS

### TRIGGER A SNAPHOT THROUGH THE V3 RDS SDK
1 reaches out to RDS with the dbInstandeIdentifier, and the snapshot identifier and triggers a snapshot.

### POLL THE SNAPSHOT PROCESS AS THE CREATING EVENT IS INVOKED
2.  The script begins to poll the snapshot process, baby sitting the snapshot until it is complete. It is listening for the event `AVAILABLE` for the DATA DUMP stage to being.

### POLL THE SNAPSHOT PROCESS AS THE AVAILABLE EVENT IS INVOKED
3. Once that AVAILABLE event is invoked, the system then takes that snapshot and generates a Database dump.

### POLL THE SNAPSHOT PROCESS AS THE DATA DUMP EVENT IS INVOKED
4.  Once the dump is complete, the system then begins the final stage to persist structure and data into a docker instance.


### DATA THAT YOU NEED TO KNOCK THIS OUT
>There is a file called env.sh.  ALl the env variables for this project can go there.  It is an ignored file for security.
```bash
#!/bin/bash

export DB_CLUSTER_ENDPOINT=""
export SNAPSHOT_IDENTIFIER=""
export DB_INSTANCE_IDENTIFIER=""
export CONTAINER_NAME=""
export RDS_USERNAME=""
export RDS_PASSWORD=""
export RDS_DATABASE=""

#
#To use it:
#  Save the script as something like export_vars.sh
#  Make it executable with chmod +x export_vars.sh
#  Source it in your shell with . ./export_vars.sh or source ./
```

You'll also need the channel id of the slack channel you'll be sending messages to. 
But that is not integral to this process.

