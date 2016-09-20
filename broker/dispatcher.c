#define _GNU_SOURCE
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <unistd.h>
#include <zmq.h>
#include <signal.h>
#include <sys/wait.h>
#include <sys/types.h>
#include <jansson.h>

#ifdef NAGIOS
#include <nagios/nebcallbacks.h>
#include <nagios/nebstructs.h>
#include <nagios/nagios.h>
#include <nagios/broker.h>
#else
#include "include/naemon/naemon.h"
#endif

NEB_API_VERSION(CURRENT_NEB_API_VERSION);
int			 counter;
static nebmodule	*mhandle;
pid_t			 phppid;
void			*context;
void			*sender = NULL;
int			 verbose = 0;
extern int		 debug_level;


void
print_verbose(char *msg)
{

	if (verbose == 0)
		return;

#ifdef NAGIOS
	write_to_all_logs(msg, NSLOG_INFO_MESSAGE);
#else
	nm_log(NSLOG_INFO_MESSAGE, msg)
#endif

}

int
start_connection()
{

	print_verbose("Creating new ZMQ context");
	context = zmq_ctx_new();
	if (context == NULL) {
#ifdef NAGIOS
		write_to_all_logs(strerror(errno), NSLOG_INFO_MESSAGE);
#else
		nm_log(NSLOG_INFO_MESSAGE, "%s\n", strerror(errno));
#endif
		return ERROR;
	}


	print_verbose("Creating new ZMQ socket");
	sender = zmq_socket(context, ZMQ_PUB);
	if (sender == NULL) {
#ifdef NAGIOS
		write_to_all_logs(strerror(errno), NSLOG_INFO_MESSAGE);
#else
		nm_log(NSLOG_INFO_MESSAGE, "%s\n", strerror(errno));
#endif
		return ERROR;
	}

	print_verbose("Binding ZMQ socket");
	if (zmq_bind(sender, "tcp://*:6969") != 0) {
#ifdef NAGIOS
		write_to_all_logs(strerror(errno), NSLOG_INFO_MESSAGE);
#else
		nm_log(NSLOG_INFO_MESSAGE, "%s\n", strerror(errno));
#endif
		return ERROR;
	}

	print_verbose("Dispatcher ready");
	return OK;
}

int
handle_check(int type, void *data)
{
	zmq_msg_t			 out;
	int				 len;
	int				 ret;
	char				*strjson;
	char				*strmsg;
	json_t				*json;
	nebstruct_service_check_data	*check;
	service				*svc;
	json_error_t			 error;


	if (sender == NULL) {
		ret = start_connection();
		if (ret != OK)
			return OK;
	}

	print_verbose("Check handler start");

	check = (nebstruct_service_check_data *)data;
	if (check->type != NEBTYPE_SERVICECHECK_PROCESSED) {
		print_verbose("Not a NEBTYPE_SERVICECHECK_PROCESSED event");
		return OK;
	}


	svc = find_service(
	    check->host_name,
	    check->service_description
	);
	if (svc == NULL) {
		print_verbose("Unable to locate service");
		return OK;
	}

	json = json_pack_ex(
	    &error,
	    0,
	    "{sssssssssisisisisIsisisi}",
	    "host_name",
	    check->host_name,
	    "service_description",
	    check->service_description,
	    "output",
	    (check->output == NULL) ? "null" : check->output,
	    "perf_data",
	    (check->perf_data == NULL) ? "null" : check->perf_data,
	    "current_attempt",
	    check->current_attempt,
	    "state",
	    check->state,
	    "state_type",
	    check->state_type,
	    "return_code",
	    check->return_code,
	    "timestamp",
	    (json_int_t)check->timestamp.tv_sec,
	    "scheduled_downtime_depth",
	    svc->scheduled_downtime_depth,
	    "problem_has_been_acknowledged",
	    svc->problem_has_been_acknowledged,
	    "notifications_enabled",
	    svc->notifications_enabled
	);

	if (json == NULL) {
#ifdef NAGIOS
		write_to_all_logs(error.text, NSLOG_INFO_MESSAGE);
#else
		nm_log(NSLOG_INFO_MESSAGE, error.text);
#endif
		return OK;
	}

	strjson = json_dumps(json, 0);
	if (json == NULL) {
#ifdef NAGIOS
		write_to_all_logs("unable to dump json -> string", NSLOG_INFO_MESSAGE);
#else
		nm_log(NSLOG_INFO_MESSAGE, "unable to dump json -> string\n");
#endif
		json_decref(json);
		return OK;
	}
	json_decref(json);

	asprintf(&strmsg, "events %s", strjson);
	free(strjson);
	len = strlen(strmsg);

	if (zmq_msg_init_size(&out, len) != 0) {
#ifdef NAGIOS
		write_to_all_logs(strerror(errno), NSLOG_INFO_MESSAGE);
#else
		nm_log(NSLOG_INFO_MESSAGE, "%s\n", strerror(errno));
#endif
		free(strmsg);
		return OK;
	}

	memcpy(zmq_msg_data(&out), strmsg, len);
	free(strmsg);

	if (zmq_msg_send(&out, sender, 0) != len) {
#ifdef NAGIOS
		write_to_all_logs(strerror(errno), NSLOG_INFO_MESSAGE);
#else
		nm_log(NSLOG_INFO_MESSAGE, "%s\n", strerror(errno));
#endif
		zmq_msg_close(&out);
		return OK;
	}

	zmq_msg_close(&out);
	print_verbose("Check handler end, message sent.");

	return OK;
}

int
nebmodule_init(int flags, char *args, void *handle)
{
	mhandle = handle;

#ifdef NAGIOS
	write_to_all_logs("starting websocket dispatcher", NSLOG_INFO_MESSAGE);
#else
	nm_log(NSLOG_INFO_MESSAGE, "starting websocket dispatcher\n");
#endif
	neb_register_callback(
	    NEBCALLBACK_SERVICE_CHECK_DATA,
	    mhandle,
	    0,
	    handle_check
	);

#ifdef NAGIOS
	write_to_all_logs("websocket dispatcher started", NSLOG_INFO_MESSAGE);
#else
	nm_log(NSLOG_INFO_MESSAGE, "websocket dispatcher started\n");
#endif

	if (debug_level & DEBUGL_EVENTBROKER) {
		verbose = 1;
	}

	return OK;
}

int
nebmodule_deinit(int flags, int reason)
{
	zmq_close(sender);
	zmq_ctx_destroy(context);

	neb_deregister_callback(
	    NEBCALLBACK_SERVICE_CHECK_DATA,
	    handle_check
	);

	print_verbose("Dispatcher stopped");
	return OK;
}
